import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild,
  OnInit,
} from '@angular/core';
import { Engine, Render, Runner, World, Bodies, Svg, Body } from 'matter-js';
import * as decomp from 'poly-decomp';
import { Common } from 'matter-js';
import * as Matter from 'matter-js';
import CircleType from 'circletype';
import { ActivatedRoute } from '@angular/router';
import { JarService } from 'src/app/core/services/jar.service';
import { MatDialog } from '@angular/material/dialog';
import { JarsListComponent } from '../jars-list/jars-list.component';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { RequestListComponent } from '../request-list/request-list.component';
import { RequestService } from 'src/app/core/services/request.service';
import { SettingsComponent } from '../settings/settings.component';

@Component({
  selector: 'app-swear-jar',
  templateUrl: './swear-jar.component.html',
  styleUrls: ['./swear-jar.component.scss'],
})
export class SwearJarComponent implements AfterViewInit, OnInit {
  constructor(
    private route: ActivatedRoute,
    private jarService: JarService,
    private dialog: MatDialog,
    private AuthService: AuthService,
    private RequestService: RequestService
  ) {}
  @ViewChild('canvasContainer', { static: true }) containerRef!: ElementRef;
  @ViewChild('container', { static: true })
  coinContainer!: ElementRef<SVGSVGElement>;
  @ViewChild('curvedText', { static: false }) curvedText!: ElementRef;

  engine = Engine.create();
  world = this.engine.world;
  render!: Render;
  allVertices: any[] = [];
  coins: any[] = [];
  id: string = '';
  jar: any = {};
  count: number = 0;
  hasPendingNotifications: boolean = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id')!;
      this._loadJar();
    });
    this.AuthService.currentUser$.subscribe((user) => {
      if (user) {
        this._getNotifications(user.uid);
      }
    });
  }

  private _loadJar() {
    this.jarService.getJar(this.id).subscribe((jar) => {
      this.jar = jar;
      if (this.curvedText && this.curvedText.nativeElement) {
        this.curvedText.nativeElement.textContent = this.jar.username;
        new CircleType(this.curvedText.nativeElement).dir(-1).radius(750);
      }
      this.count = this.jar.count;
      this.initCount(this.count);
    });
  }

  private _getNotifications(userUid: string) {
    this.RequestService.loadPendingRequests(userUid);
    this.RequestService.getPendingRequests$().subscribe((requests) => {
      this.hasPendingNotifications = requests.length > 0;
    });
  }

  ngAfterViewInit() {
    this.render = Render.create({
      element: this.containerRef.nativeElement,
      engine: this.engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent',
      },
    });

    Render.run(this.render);
    Runner.run(Runner.create(), this.engine);

    const svgElement = this.coinContainer.nativeElement;
    const paths = svgElement.querySelectorAll('path');

    paths.forEach((path: SVGPathElement) => {
      Common.setDecomp(decomp);
      const vertices = Svg.pathToVertices(path, 10);

      const body = Bodies.fromVertices(
        0,
        0,
        [vertices],
        {
          render: {
            fillStyle: 'transparent',
          },
          isStatic: true,
        },
        true
      );

      // 2. Récupération de la taille du canvas
      const canvasWidth = window.innerWidth;
      const canvasHeight = window.innerHeight;

      // 3. Calcul du déplacement nécessaire
      const dx =
        canvasWidth / 2 -
        body.bounds.min.x -
        (body.bounds.max.x - body.bounds.min.x) / 2;
      const dy =
        canvasHeight / 2 -
        body.bounds.min.y -
        (body.bounds.max.y - body.bounds.min.y) / 2;

      // 4. Déplacement du body
      Body.translate(body, { x: dx, y: dy });
      this.allVertices.push(body);
    });

    World.add(this.world, this.allVertices);
  }

  initCount(count: number) {
    this.startEjectCoinLoop().subscribe(() => {
      for (let step = 0; step < count; step++) {
        this.dropCoinWithoutOffset();
      }
    });
  }

  dropCoinWithoutOffset() {
    const canvasWidth = window.innerWidth;

    const x = canvasWidth / 2;
    const y = -20;

    const ovale = this.createEllipseBody(x, y, 27, 24, {
      restitution: 0.5,
      render: {
        sprite: {
          texture: 'assets/coin-sm.png',
          xScale: 1,
          yScale: 1,
        },
      },
    });

    World.add(this.world, ovale);
    this.coins.push(ovale);
  }

  dropCoin() {
    this.count = this.count + 1;
    this.jarService.updateCount(this.count, this.id);

    const canvasWidth = window.innerWidth;

    // Variation aléatoire autour du centre : entre -50 et +50 px
    const offset = (Math.random() - 0.5) * 100;

    const x = canvasWidth / 2 + offset;
    const y = -20;

    const ovale = this.createEllipseBody(x, y, 27, 24, {
      restitution: 0.5,
      render: {
        sprite: {
          texture: 'assets/coin-sm.png',
          xScale: 1,
          yScale: 1,
        },
      },
    });

    World.add(this.world, ovale);
    this.coins.push(ovale);
  }

  resetCoin() {
    this.startEjectCoinLoop().subscribe(() => {
      this.count = 0;
      this.jarService.updateCount(this.count, this.id);
    });
  }

  ejectCoin() {
    const potBounds = this.getBoundsOfBodies(this.allVertices);
    this.coins = this.coins.filter((piece) => {
      const pos = piece.position;
      const isInPot =
        pos.x > potBounds.xMin &&
        pos.x < potBounds.xMax &&
        pos.y > potBounds.yMin &&
        pos.y < potBounds.yMax;

      if (isInPot) {
        // Appliquer la force + rotation
        const forceX = (Math.random() - 0.5) * 0.05;
        const forceY = -0.05 - Math.random() * 0.05;

        Matter.Body.applyForce(piece, piece.position, { x: forceX, y: forceY });
        Matter.Body.setAngularVelocity(piece, 0.0005);
      } else {
        Matter.World.remove(this.engine.world, piece);
      }

      return isInPot; // garder dans le tableau uniquement si dans le pot
    });
  }

  startEjectCoinLoop(): Observable<void> {
    return new Observable((observer) => {
      const intervalId = setInterval(() => {
        if (this.coins.length === 0) {
          clearInterval(intervalId);
          observer.next(); // Notifier la fin
          observer.complete(); // Compléter l'observable
          return;
        }
        this.ejectCoin();
      }, 60);

      // Gestion du nettoyage si l'observable est unsubscribed avant la fin
      return () => clearInterval(intervalId);
    });
  }

  getBoundsOfBodies(bodies: Matter.Body[]) {
    const xs = bodies.flatMap((body) => [body.bounds.min.x, body.bounds.max.x]);
    const ys = bodies.flatMap((body) => [body.bounds.min.y, body.bounds.max.y]);
    return {
      xMin: Math.min(...xs),
      xMax: Math.max(...xs),
      yMin: Math.min(...ys),
      yMax: Math.max(...ys),
    };
  }

  createEllipseBody(
    x: any,
    y: any,
    radiusX: any,
    radiusY: any,
    options: any,
    vertexCount = 30
  ) {
    const vertices = [];

    for (let i = 0; i < vertexCount; i++) {
      const angle = ((Math.PI * 2) / vertexCount) * i;
      const vx = radiusX * Math.cos(angle);
      const vy = radiusY * Math.sin(angle);
      vertices.push({ x: vx, y: vy });
    }
    return Bodies.fromVertices(x, y, [vertices], options, true);
  }

  openJarsList() {
    this.dialog.open(JarsListComponent, {
      data: { id: this.id },
    });
  }

  openNotificationsList() {
    this.dialog.open(RequestListComponent);
  }

  openSettings() {
    this.dialog.open(SettingsComponent);
  }
}
