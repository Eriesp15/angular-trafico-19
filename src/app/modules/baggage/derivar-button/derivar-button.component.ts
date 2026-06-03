import { Component, Input, Output, OnDestroy, OnInit, EventEmitter } from '@angular/core';import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';
import { ActionWizardService } from '../claim/action-wizard/action-wizard.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { ApiClaimService } from '../services/api-claim.service';

@Component({
    selector: 'app-derivar-button',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './derivar-button.component.html',
    styleUrls: ['./derivar-button.component.scss']
})
export class DerivarButtonComponent implements OnInit, OnDestroy {
    @Input() claim: any;
    @Input() buttonLabel = 'Enviar para Reparación';
    currentUserName = '';

    private destroy$ = new Subject<void>();

    constructor(
        private wizardService: ActionWizardService,
        private userService: UserService,
        private claimService: ApiClaimService
    ) {}

    ngOnInit(): void {

        this.userService.user$
            .pipe(takeUntil(this.destroy$))
            .subscribe((user: User) => {
                this.currentUserName = (user as any)?.name || (user as any)?.email || '';
            });
        this.claimService.getUser().subscribe((user: any) => {
            console.warn()
        })
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
    @Output() completed = new EventEmitter<void>();

    openDerivar(): void {
        if (!this.claim) return;

        const currentOffice =
            this.claim?.claim?.currentStation ||
            this.claim?.currentStation ||
            this.claim?.claim?.openedStation ||
            this.claim?.openedStation ||
            '-';

        const enrichedPirData = {
            ...this.claim,
            pirId:
                this.claim?.pirId ||
                this.claim?.traceRoute?.pirId ||
                this.claim?.bagDescriptions?.[0]?.pirId ||
                this.claim?.id ||
                null,
            currentOffice,
            loggedUserName: this.currentUserName,
            registeredBy: this.currentUserName,
            todayFlightDate: this.getTodayDateTimeLocal()
        };

        this.wizardService.open('TRANSFER_BAG', enrichedPirData, () => {
            this.completed.emit();
        });
    }

    getTodayDateTimeLocal(): string {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const localDate = new Date(now.getTime() - offset * 60000);
        return localDate.toISOString().slice(0, 16);
    }
}
