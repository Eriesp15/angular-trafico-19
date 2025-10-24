import { Routes } from '@angular/router';
import { BaggageComponent } from './baggage.component';
import { FollowComponent } from './follow/follow.component';
import { ListComponent } from './claim/list/list.component';
import { NewClaimComponent } from './claim/new-claim/new-claim.component';

export default [
    {
        path: '',
        component: BaggageComponent,
        children: [
            {
                path: 'follow',
                component: FollowComponent,
                children: [
                    {
                        path: ':id',
                        component: FollowComponent,
                    },
                ]
            },
            {
                path: 'claim',
                component: ListComponent,
                children: [
                    {
                        path: 'new',
                        component: NewClaimComponent,
                    },
                ]
            },
            /*{
                path: 'claim',
                component: ListComponent,
                children: [

                ]
            },
            {
                path: 'claim/new',
                component: NewClaimComponent,
                children: [
                ]
            }*/
        ]
    }
] as Routes;
