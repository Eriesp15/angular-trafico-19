/* eslint-disable */
import { ErpNavigationItem } from '@erp/components/navigation';

export const defaultNavigation: ErpNavigationItem[] = [
    {
        id   : 'baggage',
        title: 'Equipajes',
        type : 'collapsable',
        icon : 'heroicons_outline:chart-pie',
        children:[
            {
                id   : 'follow',
                title: 'Seguimiento',
                type : 'basic',
                icon : 'heroicons_outline:chart-pie',
                link : '/baggage/follow'
            },
            {
                id   : 'claim',
                title: 'Relamos',
                type : 'basic',
                icon : 'heroicons_outline:chart-pie',
                link : '/baggage/claim',
            }
        ]
    },
];
export const compactNavigation: ErpNavigationItem[] = [
    {
        id   : 'baggage',
        title: 'Equipajes',
        type : 'collapsable',
        icon : 'heroicons_outline:chart-pie',
        children:[
            {
                id   : 'follow',
                title: 'Seguimiento',
                type : 'basic',
                icon : 'heroicons_outline:chart-pie',
                link : '/baggage/follow'
            },
            {
                id   : 'claim',
                title: 'Relamos',
                type : 'basic',
                icon : 'heroicons_outline:chart-pie',
                link : '/baggage/claim'
            }
        ]
    },

];
export const futuristicNavigation: ErpNavigationItem[] = [
    {
        id   : 'baggage',
        title: 'Equipajes',
        type : 'collapsable',
        icon : 'heroicons_outline:chart-pie',
        children:[
            {
                id   : 'follow',
                title: 'Seguimiento',
                type : 'basic',
                icon : 'heroicons_outline:chart-pie',
                link : '/baggage/follow'
            },
            {
                id   : 'claim',
                title: 'Relamos',
                type : 'basic',
                icon : 'heroicons_outline:chart-pie',
                link : '/baggage/claim'
            }
        ]
    },
];
export const horizontalNavigation: ErpNavigationItem[] = [
    {
        id   : 'baggage',
        title: 'Equipajes',
        type : 'collapsable',
        icon : 'heroicons_outline:chart-pie',
        children:[
            {
                id   : 'follow',
                title: 'Seguimiento',
                type : 'basic',
                icon : 'heroicons_outline:chart-pie',
                link : '/baggage/follow'
            },
            {
                id   : 'claim',
                title: 'Relamos',
                type : 'basic',
                icon : 'heroicons_outline:chart-pie',
                link : '/baggage/claim'
            }
        ]
    },
];
