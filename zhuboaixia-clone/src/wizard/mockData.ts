// src/wizard/mockData.ts
import type { FaceItem, CargoProduct, SkillDef, ActionDef } from './types'

export const FACE_LIBRARY: FaceItem[] = [
  { id: 'f1',  name: '小美', gender: 'female', ageGroup: '3-6',  emoji: '👧', color: '#FFB3D9' },
  { id: 'f2',  name: '小丽', gender: 'female', ageGroup: '3-6',  emoji: '👧', color: '#FFD4E8' },
  { id: 'f3',  name: '小红', gender: 'female', ageGroup: '3-6',  emoji: '👧', color: '#FFCCE0' },
  { id: 'f4',  name: '小花', gender: 'female', ageGroup: '7-12', emoji: '👧', color: '#FFC0D0' },
  { id: 'f5',  name: '小燕', gender: 'female', ageGroup: '7-12', emoji: '👧', color: '#FFB6C1' },
  { id: 'f6',  name: '小芳', gender: 'female', ageGroup: '7-12', emoji: '👧', color: '#FFA0B4' },
  { id: 'f7',  name: '小翠', gender: 'female', ageGroup: '7-12', emoji: '👧', color: '#FF90A8' },
  { id: 'f8',  name: '小雪', gender: 'female', ageGroup: '3-6',  emoji: '👧', color: '#FFD0E0' },
  { id: 'f9',  name: '小月', gender: 'female', ageGroup: '7-12', emoji: '👧', color: '#FF80A0' },
  { id: 'f10', name: '小星', gender: 'female', ageGroup: '3-6',  emoji: '👧', color: '#FFCADA' },
  { id: 'm1',  name: '小明', gender: 'male',   ageGroup: '3-6',  emoji: '👦', color: '#B3D4FF' },
  { id: 'm2',  name: '小强', gender: 'male',   ageGroup: '3-6',  emoji: '👦', color: '#A0C8FF' },
  { id: 'm3',  name: '小刚', gender: 'male',   ageGroup: '3-6',  emoji: '👦', color: '#90BCFF' },
  { id: 'm4',  name: '小虎', gender: 'male',   ageGroup: '7-12', emoji: '👦', color: '#80B0FF' },
  { id: 'm5',  name: '小龙', gender: 'male',   ageGroup: '7-12', emoji: '👦', color: '#70A4FF' },
  { id: 'm6',  name: '小宝', gender: 'male',   ageGroup: '3-6',  emoji: '👦', color: '#B8D8FF' },
  { id: 'm7',  name: '小豪', gender: 'male',   ageGroup: '7-12', emoji: '👦', color: '#60A0FF' },
  { id: 'm8',  name: '小杰', gender: 'male',   ageGroup: '3-6',  emoji: '👦', color: '#C0DCFF' },
  { id: 'm9',  name: '小鹏', gender: 'male',   ageGroup: '7-12', emoji: '👦', color: '#50A0FF' },
  { id: 'm10', name: '小威', gender: 'male',   ageGroup: '7-12', emoji: '👦', color: '#40A0FF' },
]

export const CARGO_PRODUCTS: CargoProduct[] = [
  { id: 'p1', linkNum: 1, name: '女童春款碎花连衣裙', price: '¥129',
    images: ['img1', 'img2', 'img3', 'img4'], emoji: '👗', color: '#FFD0E8', genderTag: 'female', bodySlot: 'dress' },
  { id: 'p2', linkNum: 2, name: '男童纯棉印花T恤',   price: '¥89',
    images: ['img1', 'img2', 'img3'], emoji: '👕', color: '#B3D4FF', genderTag: 'male', bodySlot: 'top' },
  { id: 'p3', linkNum: 3, name: '儿童防晒衣外套',    price: '¥159',
    images: ['img1', 'img2', 'img3'], emoji: '🧥', color: '#C8F0D0', genderTag: 'neutral', bodySlot: 'outer' },
  { id: 'p4', linkNum: 4, name: '女童百褶半身裙',    price: '¥99',
    images: ['img1', 'img2', 'img3', 'img4'], emoji: '🩳', color: '#FFE0B0', genderTag: 'female', bodySlot: 'bottom' },
  { id: 'p5', linkNum: 5, name: '男童运动裤',        price: '¥79',
    images: ['img1', 'img2', 'img3'], emoji: '👖', color: '#D0E0FF', genderTag: 'male', bodySlot: 'bottom' },
  { id: 'p6', linkNum: 6, name: '女童蕾丝上衣',      price: '¥109',
    images: ['img1', 'img2', 'img3'], emoji: '👚', color: '#FFD4F0', genderTag: 'female', bodySlot: 'top' },
  { id: 'p7', linkNum: 7, name: '女童蝴蝶结公主鞋',  price: '¥129',
    images: ['img1', 'img2', 'img3'], emoji: '👟', color: '#FFDDE8', genderTag: 'female', bodySlot: 'shoes' },
  { id: 'p8', linkNum: 8, name: '男童网面运动鞋',    price: '¥139',
    images: ['img1', 'img2', 'img3'], emoji: '👟', color: '#D4E8FF', genderTag: 'male', bodySlot: 'shoes' },
]

export const SKILL_DEFS: SkillDef[] = [
  {
    id: 'sp-daily',
    name: '日常动作',
    required: true,
    description: '没有口令时的默认待机循环，形象持续做这些动作保持活跃感',
    clipCount: 8,
  },
  {
    id: 'sp-enter',
    name: '进场动作',
    required: true,
    description: '形象登场时的入场动画，口令触发',
    clipCount: 1,
    fixedClips: true,
  },
  {
    id: 'sp-exit',
    name: '出场动作',
    required: true,
    description: '形象退场时的离开动画，口令触发',
    clipCount: 1,
    fixedClips: true,
  },
  {
    id: 'sp-auto-outfit',
    name: '自动换装',
    required: true,
    description: '讲解商品时自动切换穿搭，复用进/出场动作，无需额外素材',
    clipCount: 'none',
  },
  {
    id: 'sp-showcase',
    name: '穿版展示',
    required: true,
    description: '主播讲解时同步展示上身效果，复用进/出场动作，无需额外素材',
    clipCount: 'none',
  },
  {
    id: 'sp-urge',
    name: '逼单助攻',
    required: false,
    description: '主播逼单时触发特定动作，强化购买冲动',
    clipCount: 3,
  },
  {
    id: 'sp-affirm',
    name: '效果肯定',
    required: false,
    description: '主播塑品时同步配合动作，增强信任感',
    clipCount: 3,
  },
  {
    id: 'sp-thanks',
    name: '感谢下单',
    required: false,
    description: '感谢话术时触发庆祝动作，活跃直播间气氛',
    clipCount: 3,
  },
  {
    id: 'sp-demo',
    name: '产品演示',
    required: false,
    description: '演示商品细节时配合展示动作',
    clipCount: 3,
  },
  {
    id: 'sp-perform',
    name: '整活表演',
    required: false,
    description: '口令触发才艺表演，活跃直播间氛围',
    clipCount: 3,
  },
]

export const ACTION_LIBRARY: ActionDef[] = [
  { id: 'a1',  name: '入场走步',   duration: 5  },
  { id: 'a2',  name: 'T台转身',    duration: 8  },
  { id: 'a3',  name: '侧身展示',   duration: 6  },
  { id: 'a4',  name: '指向商品',   duration: 4  },
  { id: 'a5',  name: '点头认可',   duration: 3  },
  { id: 'a6',  name: '鼓掌欢呼',   duration: 5  },
  { id: 'a7',  name: '比心',       duration: 4  },
  { id: 'a8',  name: '鞠躬感谢',   duration: 5  },
  { id: 'a9',  name: '挥手再见',   duration: 4  },
  { id: 'a10', name: '指向小黄车', duration: 6  },
  { id: 'a11', name: '倒数321',    duration: 6  },
  { id: 'a12', name: '操作手机',   duration: 8  },
  { id: 'a13', name: '展示细节',   duration: 7  },
  { id: 'a14', name: '转圈展示',   duration: 8  },
  { id: 'a15', name: '蹦跳欢呼',   duration: 6  },
  { id: 'a16', name: '摇摆展示',   duration: 7  },
  { id: 'a17', name: '拍手节拍',   duration: 5  },
  { id: 'a18', name: '鲨鱼摇',     duration: 12 },
  { id: 'a19', name: '刀马刀马',   duration: 10 },
  { id: 'a20', name: '大舌头',     duration: 8  },
]

export const CLIP_COLORS = ['#FFB3D9','#B3D4FF','#C8F0D0','#FFE0B0','#D0E0FF','#FFD4F0','#FFCCE0','#A0C8FF']

// 20个动作在弹窗里的演示预览色（每个动作固定一种颜色）
export const ACTION_PREVIEW_COLORS = [
  '#FFB3D9','#B3D4FF','#C8F0D0','#FFE0B0','#D0E0FF',
  '#FFD4F0','#FFCCE0','#A0C8FF','#F0E8D0','#D8F0E8',
  '#E8D8FF','#FFE8C8','#D0F4FF','#FFD4C0','#C0E8D8',
  '#F4FFD0','#FFE0D8','#D4C8FF','#FFD0C0','#C8F4D8',
]

const SKILL_ACTIONS: Record<string, string[]> = {
  'sp-daily':   ['a2', 'a3', 'a5', 'a6', 'a7', 'a14', 'a15', 'a17'],
  'sp-urge':    ['a10', 'a11', 'a4'],
  'sp-affirm':  ['a5', 'a7', 'a6'],
  'sp-thanks':  ['a8', 'a7', 'a15'],
  'sp-demo':    ['a13', 'a4', 'a3'],
  'sp-perform': ['a18', 'a19', 'a20'],
}

export function generateMaterials(skillId: string): import('./types').MaterialClip[] {
  if (skillId === 'sp-enter') {
    const action = ACTION_LIBRARY.find(a => a.id === 'a1')!
    return [{ id: `${skillId}-clip-0`, actionId: action.id, actionName: action.name, duration: action.duration, color: CLIP_COLORS[0], confirmed: true }]
  }
  if (skillId === 'sp-exit') {
    const action = ACTION_LIBRARY.find(a => a.id === 'a9')!
    return [{ id: `${skillId}-clip-0`, actionId: action.id, actionName: action.name, duration: action.duration, color: CLIP_COLORS[1], confirmed: true }]
  }
  if (skillId === 'sp-auto-outfit' || skillId === 'sp-showcase') {
    return []
  }
  const actionIds = SKILL_ACTIONS[skillId] ?? ACTION_LIBRARY.slice(0, 3).map(a => a.id)
  return actionIds.map((actionId, i) => {
    const action = ACTION_LIBRARY.find(a => a.id === actionId)!
    return {
      id: `${skillId}-clip-${i}`,
      actionId,
      actionName: action.name,
      duration: action.duration,
      color: CLIP_COLORS[i % CLIP_COLORS.length],
      confirmed: true,
    }
  })
}
