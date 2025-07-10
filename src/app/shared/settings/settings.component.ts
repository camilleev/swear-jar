import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { GroupService } from 'src/app/core/services/group.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<SettingsComponent>,
    private router: Router,
    private GroupService: GroupService,
    private AuthService: AuthService
  ) {}

  groups: any[] = [];
  user: any = {};

  ngOnInit(): void {
    this.AuthService.currentUser$.subscribe((user) => {
      if (user) {
        this.user = user;
      }
    });
    this.GroupService.getAllGroups().subscribe((groups) => {
      this.groups = groups.filter((g) => g.creator === this.user.uid);
    });
  }

  navigateTo(page: string, groupId?: string) {
    if (groupId) {
      this.router.navigate([`/${page}`, groupId]);
    } else {
      this.router.navigate([`/${page}`]);
    }
    this.close();
  }

  close() {
    this.dialogRef.close();
  }
}
