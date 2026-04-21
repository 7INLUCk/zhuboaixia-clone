// src/wizard/types.ts

export type FaceItem = {
  id: string
  name: string
  gender: 'male' | 'female'
  ageGroup: '3-6' | '7-12'
  emoji: string
  color: string
}

export type BodySlot = 'top' | 'bottom' | 'dress' | 'outer' | 'shoes' | 'accessory'

export type FixedSlotKey = 'top' | 'bottom' | 'shoes'

export type CargoProduct = {
  id: string
  linkNum: number
  name: string
  price: string
  images: string[]
  emoji: string
  color: string
  genderTag: 'female' | 'male' | 'neutral'
  bodySlot: BodySlot
}

// Fixed 3-slot outfit model: top | bottom | shoes
// dress product fills both top AND bottom with same productId
export type OutfitSlot = {
  slot: FixedSlotKey
  productId: string | null
  selectedImageIndex: number
  source: 'product' | 'uploaded' | 'empty'
}

export type AvatarMode = 'ip' | 'universal' | 'product-bound'

export type PortraitStatus = 'pending' | 'generating' | 'reviewing' | 'confirmed'

export type ReviewStatus = 'unsubmitted' | 'reviewing' | 'approved'

export type PortraitRound = {
  id: string
  colorIdx: number   // mock: index into PORTRAIT_COLORS
}

export type AvatarConfig = {
  id: string
  name: string
  mode: AvatarMode
  faceId: string
  outfitSlots: OutfitSlot[]   // always 3 entries: top / bottom / shoes
  portraitStatus: PortraitStatus
  portraitAdjustCount: number
  portraitPrompt: string
  portraitRounds: PortraitRound[]
  portraitAppliedRoundId: string | null
  portraitViewingRoundId: string | null
  selectedSkillIds: string[]
  materials: Record<string, MaterialClip[]>
  materialsDone: boolean
  reviewStatus: ReviewStatus
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
  clipCount: number | 'none'  // 'none' = 复用其他动作，无独立素材
  fixedClips?: boolean        // true = 素材固定，不可替换
}

export type ActionDef = {
  id: string
  name: string
  duration: number
}

export type WizardState = {
  selectedProductIds: string[]
  selectedFaceIds: string[]
  faceTypes: Record<string, 'ip' | 'realistic'>
  avatarConfigs: AvatarConfig[]
}

export type WizardResult = WizardState
