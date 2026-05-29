import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';
import { ActionWizardService } from '../claim/action-wizard/action-wizard.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';

@Component({
    selector: 'app-derivar-button',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './derivar-button.component.html',
    styleUrls: ['./derivar-button.component.scss']
})
export class DerivarButtonComponent implements OnInit, OnDestroy {
    @Input() claim: any;
    currentUserName = '';

    private destroy$ = new Subject<void>();

    constructor(
        private wizardService: ActionWizardService,
        private userService: UserService
    ) {}

    ngOnInit(): void {
        this.userService.user$
            .pipe(takeUntil(this.destroy$))
            .subscribe((user: User) => {
                this.currentUserName = (user as any)?.name || (user as any)?.email || '';
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

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

        this.wizardService.open('TRANSFER_BAG', enrichedPirData);
    }

    getTodayDateTimeLocal(): string {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const localDate = new Date(now.getTime() - offset * 60000);
        return localDate.toISOString().slice(0, 16);
    }
}
