import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { RequestTypeEnum } from 'src/app/core/enum/request-type.enum';
import { StatusEnum } from 'src/app/core/enum/status.enum';
import { GroupRequestExtendedModel } from 'src/app/core/model/group-request-extended.model';
import { JarService } from 'src/app/core/services/jar.service';
import { RequestService } from 'src/app/core/services/request.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-request-list',
  templateUrl: './request-list.component.html',
  styleUrls: ['./request-list.component.scss'],
})
export class RequestListComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<RequestListComponent>,
    private RequestService: RequestService,
    private UserService: UserService,
    private JarService: JarService
  ) {}

  requests: GroupRequestExtendedModel[] = [];
  RequestTypeEnum = RequestTypeEnum;

  ngOnInit(): void {
    this.RequestService.getPendingRequestsWithDetails$().subscribe(
      (requests) => {
        this.requests = requests;
      }
    );
  }

  close() {
    this.dialogRef.close();
  }

  acceptRequest(request: GroupRequestExtendedModel) {
    this.RequestService.updateRequestStatus$(
      request.id,
      StatusEnum.ACCEPTED
    ).subscribe({
      next: () => {
        if (request.type === RequestTypeEnum.INVITE_REQUEST) {
          this.UserService.addGroupToUser(request.toUid, request.groupId);
          this.JarService.createJar(request.toUsername).subscribe((jarId) => {
            this.JarService.addJarToGroup(
              jarId,
              request.groupId,
              request.toUid
            );
          });
          this.RequestService.loadPendingRequests(request.toUid);
        } else {
          this.UserService.addGroupToUser(request.fromUid, request.groupId);
          this.JarService.createJar(request.toUsername).subscribe((jarId) => {
            this.JarService.addJarToGroup(
              jarId,
              request.groupId,
              request.fromUid
            );
          });
          this.RequestService.loadPendingRequests(request.toUid);
        }
        this.close();
      },
      error: (err) => console.error('Erreur:', err),
    });
  }

  rejectRequest(requestId: string) {
    this.RequestService.updateRequestStatus$(requestId, StatusEnum.REJECTED);
    this.close();
  }
}
