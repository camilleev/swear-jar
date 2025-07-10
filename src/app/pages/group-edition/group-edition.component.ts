import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { GroupService } from 'src/app/core/services/group.service';
import { RequestService } from 'src/app/core/services/request.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-group-edition',
  templateUrl: './group-edition.component.html',
  styleUrls: ['./group-edition.component.css'],
})
export class GroupEditionComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private GroupService: GroupService,
    private location: Location,
    private AuthService: AuthService,
    private UserService: UserService,
    private RequestService: RequestService
  ) {}

  id: string = '';
  group: any = {};
  user: any = {};
  usersList: any;
  formGroup: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    members: new FormArray([], Validators.required),
  });

  get membersArray(): FormArray {
    return this.formGroup.get('members') as FormArray;
  }

  ngOnInit(): void {

    this.AuthService.currentUser$.subscribe((user) => {
      if (user) {
        this.user = user;
      }
    });
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id')!;
      forkJoin({
        group: this.GroupService.getGroupById(this.id),
        users: this.UserService.getAllUsers(),
      }).subscribe(({ group, users }) => {
        this.group = group;
        this.formGroup.get('name')?.setValue(group.name);
        this.usersList = users;
        this.group.members.map((m: any) => {
          const member = this.usersList.find((u: any) => u.id === m.userUid);
          if (member) {
            (this.formGroup.get('members') as FormArray).push(
              new FormControl(member)
            );
          }
        });
      });
    });
  }

  goBack(): void {
    this.location.back();
  }

  saveChanges() {
    if (this.formGroup.valid) {
      this.GroupService.updateGroupName(
        this.group.id,
        this.formGroup.get('name')?.value
      );
      const previousMembers= this.group.members.map((m:any) => m.userUid)
      const newMembers = this.formGroup.get('members')?.value.filter((u:any) =>u.id !== this.user.uid && !previousMembers.includes(u.id) )
      newMembers.forEach((member: any) => {
          this.RequestService.createInviteGroupRequest({groupId: this.group.id, fromUid: this.user.uid, toUid: member.uid})
        });
      //update removed user
    }
  }
}
