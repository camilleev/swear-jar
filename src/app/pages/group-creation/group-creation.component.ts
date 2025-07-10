import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { GroupService } from 'src/app/core/services/group.service';
import { JarService } from 'src/app/core/services/jar.service';
import { RequestService } from 'src/app/core/services/request.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-group-creation',
  templateUrl: './group-creation.component.html',
  styleUrls: ['./group-creation.component.scss'],
})
export class GroupCreationComponent implements OnInit {
  groupName: any = '';
  usersList: any;
  formSubmitted = false;
  formGroup: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    members: new FormArray([], Validators.required),
  });
  user: any;

  constructor(
    private GroupService: GroupService,
    private JarService: JarService,
    private AuthService: AuthService,
    private UserService: UserService,
    private router: Router,
    private RequestService: RequestService
  ) {}

  get membersArray(): FormArray {
    return this.formGroup.get('members') as FormArray;
  }

  ngOnInit() {
    this._getAllUsers();
  }

  private _getAllUsers() {
    this.UserService.getAllUsers().subscribe(users => this.usersList = users)
  }

  createGroup() {
    this.formSubmitted = true;
    if (this.formGroup.valid) {
      const groupName = this.formGroup.value.name;
      const members = this.formGroup.value.members.map((m: any) => m.uid);
      const userUid = this.AuthService.getCurrentUser().uid;
      this.GroupService.createGroup(groupName, userUid).subscribe(groupId => {
        // creation du group chez le createur
        this.UserService.getUser(userUid).subscribe((user) => {
          this.UserService.addGroupToUser(userUid, groupId);
          this.JarService.createJar(user.username ?? '').subscribe((jarId) => {
            this.JarService.addJarToGroup(jarId, groupId, userUid);
            if (!user.jarFav) {
              this.UserService.updateJarFav(userUid, jarId);
            }

            this.UserService.getUser(userUid).subscribe((user) => {
              this.router.navigate(['/jar', user.jarFav ?? jarId]);
            });
          });
        });
        members.forEach((memberUid: string) => {
          if (memberUid === userUid) return;
          this.RequestService.createInviteGroupRequest({groupId: groupId, fromUid: userUid, toUid: memberUid})
        });
      })
    } else {
      console.log('FORM INVALIDE');
    }
  }
}
