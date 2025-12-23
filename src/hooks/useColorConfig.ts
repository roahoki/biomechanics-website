import { useState } from 'react'

interface ColorConfig {
    socialIconColors: {
        instagram: string
        soundcloud: string
        youtube: string
        tiktok: string
        mixcloud: string 
    }
    bgColor: string
    titleColor: string
    linkCardBackgroundColor: string
    linkCardTextColor: string
    productBuyButtonColor: string
    itemButtonColor: string
}

interface UseColorConfigProps {
    initialSocialIconColors: ColorConfig['socialIconColors']
    initialBgColor: string
    initialTitleColor: string
    initialLinkCardBackgroundColor: string
    initialLinkCardTextColor: string
    initialProductBuyButtonColor: string
    initialItemButtonColor: string
}

export function useColorConfig({
    initialSocialIconColors,
    initialBgColor,
    initialTitleColor,
    initialLinkCardBackgroundColor,
    initialLinkCardTextColor,
    initialProductBuyButtonColor,
    initialItemButtonColor
}: UseColorConfigProps) {
    const [socialIconColors, setSocialIconColors] = useState(initialSocialIconColors)
    const [bgColor, setBgColor] = useState(initialBgColor)
    const [titleColor, setTitleColor] = useState(initialTitleColor)
    const [linkCardBackgroundColor, setLinkCardBackgroundColor] = useState(initialLinkCardBackgroundColor)
    const [linkCardTextColor, setLinkCardTextColor] = useState(initialLinkCardTextColor)
    const [productBuyButtonColor, setProductBuyButtonColor] = useState(initialProductBuyButtonColor)
    const [itemButtonColor, setItemButtonColor] = useState(initialItemButtonColor)

    // Validar color hex
    const isValidHexColor = (color: string): boolean => {
        return /^#([0-9A-F]{3}){1,2}$/i.test(color)
    }

    // Manejar cambio de color de icono social
    const handleSocialIconColorChange = (platform: string, color: string) => {
        setSocialIconColors(prev => ({
            ...prev,
            [platform]: color
        }))
    }

    return {
        socialIconColors,
        setSocialIconColors,
        bgColor,
        setBgColor,
        titleColor,
        setTitleColor,
        linkCardBackgroundColor,
        setLinkCardBackgroundColor,
        linkCardTextColor,
        setLinkCardTextColor,
        productBuyButtonColor,
        setProductBuyButtonColor,
        itemButtonColor,
        setItemButtonColor,
        isValidHexColor,
        handleSocialIconColorChange
    }
}
