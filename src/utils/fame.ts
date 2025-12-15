/**
 * 根据名声值返回对应的等级文本
 */
export function getFameStr(fame: number): string {
  if (fame >= 100) {
    return '德高望重'
  } else if (fame < 100 && fame >= 90) {
    return '非常优秀'
  } else if (fame < 90 && fame >= 80) {
    return '一般般'
  } else if (fame < 80 && fame >= 60) {
    return '不错'
  } else if (fame < 60 && fame >= 40) {
    return '不怎么样'
  } else if (fame < 40 && fame >= 20) {
    return '差'
  } else if (fame < 20 && fame >= 10) {
    return '很差'
  } else if (fame < 10) {
    return '臭名昭著'
  } else {
    return '臭名昭著'
  }
}

