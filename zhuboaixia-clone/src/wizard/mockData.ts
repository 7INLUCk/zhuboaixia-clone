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
    images: ['平铺正面图（推荐）', '模特上身图', '细节图', '颜色展示'], emoji: '👗', color: '#FFD0E8' },
  { id: 'p2', linkNum: 2, name: '男童纯棉印花T恤',   price: '¥89',
    images: ['平铺正面图（推荐）', '颜色展示', '细节图'], emoji: '👕', color: '#B3D4FF' },
  { id: 'p3', linkNum: 3, name: '儿童防晒衣外套',    price: '¥159',
    images: ['平铺正面图（推荐）', '背面图', '细节图'], emoji: '🧥', color: '#C8F0D0' },
  { id: 'p4', linkNum: 4, name: '女童百褶半身裙',    price: '¥99',
    images: ['平铺正面图（推荐）', '模特上身图', '颜色展示', '细节图'], emoji: '👗', color: '#FFE0B0' },
  { id: 'p5', linkNum: 5, name: '男童运动裤',        price: '¥79',
    images: ['平铺正面图（推荐）', '背面图', '颜色展示'], emoji: '👖', color: '#D0E0FF' },
  { id: 'p6', linkNum: 6, name: '女童蕾丝上衣',      price: '¥109',
    images: ['平铺正面图（推荐）', '细节图', '模特上身图'], emoji: '👚', color: '#FFD4F0' },
]

export const SKILL_DEFS: SkillDef[] = [
  { id: 'sp-enter',      name: '进场',     required: true,  description: '形象入场动画，口令触发' },
  { id: 'sp-exit',       name: '出场',     required: true,  description: '形象退场动画，口令触发' },
  { id: 'sp-auto-outfit',name: '自动换装', required: true,  description: '讲解商品时自动切换形象' },
  { id: 'sp-showcase',   name: '穿版展示', required: true,  description: '展示服装上身效果' },
  { id: 'sp-urge',       name: '逼单助攻', required: false, description: '主播逼单时触发动作' },
  { id: 'sp-affirm',     name: '效果肯定', required: false, description: '主播塑品时自动搭话' },
  { id: 'sp-thanks',     name: '感谢下单', required: false, description: '感谢话术时触发动作' },
  { id: 'sp-demo',       name: '产品演示', required: false, description: '演示细节时触发动作' },
  { id: 'sp-perform',    name: '整活表演', required: false, description: '口令触发才艺表演' },
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

// 每个技能默认从动作库里取的8个动作 id
export const SKILL_DEFAULT_ACTIONS: Record<string, string[]> = {
  'sp-enter':       ['a1', 'a2', 'a3', 'a14', 'a15', 'a6', 'a7', 'a17'],
  'sp-exit':        ['a9', 'a8', 'a16', 'a3', 'a7', 'a6', 'a5', 'a17'],
  'sp-auto-outfit': ['a2', 'a14', 'a3', 'a16', 'a13', 'a4', 'a7', 'a5'],
  'sp-showcase':    ['a13', 'a3', 'a14', 'a2', 'a4', 'a16', 'a7', 'a5'],
  'sp-urge':        ['a10', 'a11', 'a4', 'a5', 'a6', 'a12', 'a7', 'a17'],
  'sp-affirm':      ['a5', 'a7', 'a6', 'a4', 'a17', 'a13', 'a3', 'a16'],
  'sp-thanks':      ['a8', 'a7', 'a6', 'a5', 'a17', 'a9', 'a15', 'a1'],
  'sp-demo':        ['a13', 'a4', 'a3', 'a14', 'a16', 'a12', 'a5', 'a7'],
  'sp-perform':     ['a18', 'a19', 'a20', 'a15', 'a14', 'a6', 'a17', 'a7'],
}

const CLIP_COLORS = ['#FFB3D9','#B3D4FF','#C8F0D0','#FFE0B0','#D0E0FF','#FFD4F0','#FFCCE0','#A0C8FF']

export function generateMaterials(skillId: string): import('./types').MaterialClip[] {
  const actionIds = SKILL_DEFAULT_ACTIONS[skillId] || ACTION_LIBRARY.slice(0, 8).map(a => a.id)
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
