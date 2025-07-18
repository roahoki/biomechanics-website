export interface Product {
    id: number
    type: 'product'
    title: string
    subtitle?: string
    price: number
    paymentLink: string
    description: string
    images: string[]
    visible?: boolean
}

export interface Item {
    id: number
    type: 'item'
    title: string
    subtitle?: string
    price: number
    priceVisible: boolean
    buttonText: string
    paymentLink: string
    description: string
    images: string[]
    visible?: boolean
}

export interface Link {
    id: number
    type?: 'link'
    url: string
    label: string
    visible?: boolean
}

export type LinkItem = Link | Product | Item
