// src/wizard/types.ts

export type FaceItem = {
  id: string
  name: string
  gender: 'male' | 'female'
  ageGroup: '3-6' | '7-12'
  emoji: string
  color: string
}

export type CargoProduct = {
  id: string
  linkNum: number
  name: string
  price: string
  images: string[]   // mock 图片名列表
  emoji: string
  color: string
}

export type OutfitSlot = {
  productId: string
  selectedImageIndex: number
}

export type AvatarConfig = {
  id: string
  name: string
  type: 'product' | 'brand-ip'
  faceId: string
  outfitSlots: OutfitSlot[]
  selectedSkillIds: string[]
  materials: Record<string, MaterialClip[]>   // skillId → clips
  portraitDone: boolean
  materialsDone: boolean
}

export type MaterialClip = {
  id: string
  actionId: string
  actionName: string
  duration: number
  color: string
  confirmed: boolean
}

export type SkillDef = {
  id: string
  name: string
  required: boolean
  description: string
}

export type ActionDef = {
  id: string
  name: string
  duration: number
}

export type WizardState = {
  selectedProductIds: string[]
  selectedFaceIds: string[]       // max 2
  avatarConfigs: AvatarConfig[]
}

export type WizardResult = WizardState
