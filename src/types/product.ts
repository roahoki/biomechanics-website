export interface Product {
    id: number
    type: 'product'
    title: string
    subtitle?: string
    price: number
    paymentLink: string
    description: string
    images: string[]
}

export interface Link {
    id: number
    type?: 'link'
    url: string
    label: string
}

export type LinkItem = Link | Product
