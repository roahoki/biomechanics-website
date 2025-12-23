import { useState } from 'react'
import { type ProfileImageType } from '@/utils/file-utils'

export function useFormState() {
    const [status, setStatus] = useState<{ message?: string; error?: string } | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>('')
    const [previewType, setPreviewType] = useState<ProfileImageType>('image')
    const [selectedBackgroundFile, setSelectedBackgroundFile] = useState<File | null>(null)
    const [backgroundPreviewUrl, setBackgroundPreviewUrl] = useState<string>('')
    const [showPreviewModal, setShowPreviewModal] = useState(false)

    return {
        status,
        setStatus,
        isSubmitting,
        setIsSubmitting,
        selectedFile,
        setSelectedFile,
        previewUrl,
        setPreviewUrl,
        previewType,
        setPreviewType,
        selectedBackgroundFile,
        setSelectedBackgroundFile,
        backgroundPreviewUrl,
        setBackgroundPreviewUrl,
        showPreviewModal,
        setShowPreviewModal
    }
}
