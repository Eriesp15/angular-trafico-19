/* eslint-disable */
import { ErpNavigationItem } from '@erp/components/navigation';

export const defaultNavigation: ErpNavigationItem[] = [
    {
        id   : 'baggage',
        title: 'Equipajes',
        type : 'collapsable',
        icon : 'heroicons_outline:shopping-bag',
        children:[
            {
                id   : 'follow',
                title: 'Seguimiento',
                type : 'basic',
                icon : 'heroicons_outline:document-magnifying-glass',
                link : '/baggage/follow'
            },
            {
                id   : 'claim',
                title: 'Reclamos',
                type : 'collapsable',
                icon : 'heroicons_outline:document',
                link : '/baggage/claim/list',
                children:[
                    {
                    id   : 'follow',
                    title: 'Listado de reclamos',
                    type : 'basic',
                    icon : 'heroicons_outline:list-bullet',
                    link : '/baggage/claim/list'
                    },
                    {
                    id   : 'follow',
                    title: 'Realizar reclamo',
                    type : 'basic',
                    icon : 'heroicons_outline:newspaper',
                    link : '/baggage/claim/new'
                    },
                    {
                    id   : 'follow',
                    title: 'Visualizar reclamo',
                    type : 'basic',
                    icon : 'heroicons_outline:eye',
                    link : '/baggage/claim/view/:id'
                    }
                ]
            },
            {
                id   : 'claim',
                title: 'Indemnizaciones',
                type : 'basic',
                icon : 'heroicons_outline:banknotes',
                link : '/baggage/compensation',
            }
        ]
    },
];
export const compactNavigation: ErpNavigationItem[] = [
    {
        id   : 'baggage',
        title: 'Equipajes',
        type : 'collapsable',
        icon : 'heroicons_outline:shopping-bag',
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
                title: 'Reclamos',
                type : 'basic',
                icon : 'heroicons_outline:document',
                link : '/baggage/claim/list'
            },
            {
                id   : 'claim',
                title: 'Indemnizaciones',
                type : 'basic',
                icon : 'heroicons_outline:chart-pie',
                link : '/baggage/compensation',
            }
        ]
    },

];
export const futuristicNavigation: ErpNavigationItem[] = [
    {
        id   : 'baggage',
        title: 'Equipajes',
        type : 'collapsable',
        icon : 'heroicons_outline:shopping-bag',
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
                title: 'Reclamos',
                type : 'basic',
                icon : 'heroicons_outline:document',
                link : '/baggage/claim/list'
            },
            {
                id   : 'claim',
                title: 'Indemnizaciones',
                type : 'basic',
                icon : 'heroicons_outline:chart-pie',
                link : '/baggage/compensation',
            }
        ]
    },
];
export const horizontalNavigation: ErpNavigationItem[] = [
    {
        id   : 'baggage',
        title: 'Equipajes',
        type : 'collapsable',
        icon : 'heroicons_outline:shopping-bag',
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
                title: 'Reclamos',
                type : 'basic',
                icon : 'heroicons_outline:document',
                link : '/baggage/claim/list'
            },
            {
                id   : 'claim',
                title: 'Indemnizaciones',
                type : 'basic',
                icon : 'heroicons_outline:chart-pie',
                link : '/baggage/compensation',
            }
        ]
    },
];
