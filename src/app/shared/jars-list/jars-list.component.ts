import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { JarService } from 'src/app/core/services/jar.service';

@Component({
  selector: 'app-jars-list',
  templateUrl: './jars-list.component.html',
  styleUrls: ['./jars-list.component.scss'],
})
export class JarsListComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<JarsListComponent>,
    private JarService: JarService,
    private AuthService: AuthService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.currentJarId = data.id;
  }

  jarsList: any = [];
  user: any;
  groupFavId: string = '';
  currentJarId: string = '';

  ngOnInit(): void {
    this.AuthService.currentUser$.subscribe((user) => {
      if (user) {
        this.user = user;
        this.JarService.getUserJarsWithOwners(this.user.uid).then((list) => {
          this.jarsList = list;
          this._initGroupFav();
        });
      }
    });
  }

  _initGroupFav() {
    this.groupFavId = this.jarsList.find((group: any) =>
      group.members.some((member: any) => member.jarId === this.user.jarFav)
    )?.id;
  }

  close() {
    this.dialogRef.close();
  }

  navigateTo(jarId: string){
    this.close()
    this.router.navigate(['/jar', jarId]);
  }
}
