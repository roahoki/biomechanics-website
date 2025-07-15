import { useState } from 'react'

interface ColorConfig {
    socialIconColors: {
        instagram: string
        soundcloud: string
        youtube: string
        tiktok: string
    }
    bgColor: string
    titleColor: string
    linkCardBackgroundColor: string
    linkCardTextColor: string
    productBuyButtonColor: string
}

interface UseColorConfigProps {
    initialSocialIconColors: ColorConfig['socialIconColors']
    initialBgColor: string
    initialTitleColor: string
    initialLinkCardBackgroundColor: string
    initialLinkCardTextColor: string
    initialProductBuyButtonColor: string
}

export function useColorConfig({
    initialSocialIconColors,
    initialBgColor,
    initialTitleColor,
    initialLinkCardBackgroundColor,
    initialLinkCardTextColor,
    initialProductBuyButtonColor
}: UseColorConfigProps) {
    const [socialIconColors, setSocialIconColors] = useState(initialSocialIconColors)
    const [bgColor, setBgColor] = useState(initialBgColor)
    const [titleColor, setTitleColor] = useState(initialTitleColor)
    const [linkCardBackgroundColor, setLinkCardBackgroundColor] = useState(initialLinkCardBackgroundColor)
    const [linkCardTextColor, setLinkCardTextColor] = useState(initialLinkCardTextColor)
    const [productBuyButtonColor, setProductBuyButtonColor] = useState(initialProductBuyButtonColor)

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
        isValidHexColor,
        handleSocialIconColorChange
    }
}
