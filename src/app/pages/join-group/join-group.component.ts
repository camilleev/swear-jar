import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { GroupService } from 'src/app/core/services/group.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { RequestService } from 'src/app/core/services/request.service';

@Component({
  selector: 'app-join-group',
  templateUrl: './join-group.component.html',
  styleUrls: ['./join-group.component.css'],
})
export class JoinGroupComponent implements OnInit {
  constructor(
    private location: Location,
    private GroupService: GroupService,
    private AuthService: AuthService,
    private RequestService: RequestService
  ) {}
  groups: any[] = [];
  user: any = {};

  ngOnInit(): void {
    this.AuthService.currentUser$.subscribe((user) => {
      if (user) {
        this.user = user;
        this.GroupService.getAllGroups().subscribe((groups) => {
          this.groups = groups.filter(
            (group) =>
              !group.members.some((member: any) => member.userUid === this.user.uid)
          );
        });
      }
    });
  }
  goBack(): void {
    this.location.back();
  }

  requestJoin(group: any){
    this.RequestService.createIJoinGroupRequest({groupId: group.id, fromUid: this.user.uid, toUid: group.creator})
    this.goBack()
  }
}
