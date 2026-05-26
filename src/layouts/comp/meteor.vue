<template>
  <canvas
    id="starCanvas"
    type="2d"
    class="star-canvas"
  />
</template>

<script setup>
import { getCurrentInstance, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  maxStars: { type: Number, default: 3 }, // 同时存在的最多数
  trailLength: { type: Number, default: 30 }, // 拖尾长度
  trailColor: { type: String, default: '#e0e7ff8f' }, // 流星颜色
  lineWidth: { type: Number, default: 3 }, // 最粗处的宽度
})

// --- 状态变量 ---
const activeStars = ref([])
let ctx = null
let canvas = null
let isAnimating = false
const canvasWidth = ref(0)
const canvasHeight = ref(0)
let starCreatorTimer = null
const instance = getCurrentInstance() // 获取组件实例供 SelectorQuery 使用

// --- 核心方法 ---

// 创建流星对象
function createNewStar() {
  const startX = canvasWidth.value * (0.6 + Math.random() * 0.2)
  const startY = canvasHeight.value * (0.0 + Math.random() * 0.15)
  const endX = canvasWidth.value * (0.3 + Math.random() * 0.3)
  const endY = canvasHeight.value * (0.7 + Math.random() * 0.3)

  const duration_in_frames = 60 + Math.random() * 20
  const vx = (endX - startX) / duration_in_frames
  const vy = (endY - startY) / duration_in_frames

  return {
    id: Date.now() + Math.random(),
    points: [],
    headPosition: { x: startX, y: startY },
    endPoint: { x: endX, y: endY },
    vx,
    vy,
    isFadingOut: false,
  }
}

// 绘制单条流星
function drawSingleTrail(star) {
  if (star.points.length < 2)
    return

  // 性能优化：在绘制整条线段前 save 一次即可
  ctx.save()
  ctx.strokeStyle = props.trailColor
  ctx.lineCap = 'round'

  for (let i = 1; i < star.points.length; i++) {
    const prev = star.points[i - 1]
    const curr = star.points[i]
    const ratio = i / star.points.length

    ctx.beginPath()
    ctx.globalAlpha = ratio * 0.8
    ctx.lineWidth = props.lineWidth * ratio
    ctx.moveTo(prev.x, prev.y)
    ctx.lineTo(curr.x, curr.y)
    ctx.stroke()
  }
  ctx.restore()
}
let animationFrameId = null
// 动画循环
function renderLoop() {
  if (!canvas || !isAnimating)
    return

  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)

  // 倒序遍历方便删除
  for (let i = activeStars.value.length - 1; i >= 0; i--) {
    const star = activeStars.value[i]

    if (!star.isFadingOut) {
      star.headPosition.x += star.vx
      star.headPosition.y += star.vy
      star.points.push({ ...star.headPosition })

      if (star.points.length > props.trailLength) {
        star.points.shift()
      }

      // 边界检查
      if (star.headPosition.y > star.endPoint.y
        || star.headPosition.x < 0
        || star.headPosition.y > canvasHeight.value) {
        star.isFadingOut = true
      }
    }
    else {
      if (star.points.length > 0) {
        star.points.shift()
      }
      else {
        activeStars.value.splice(i, 1)
        continue
      }
    }
    drawSingleTrail(star)
  }

  if (canvas.requestAnimationFrame) {
    animationFrameId = canvas.requestAnimationFrame(renderLoop)
  }
  else {
    animationFrameId = window.requestAnimationFrame(renderLoop)
  }
}
onBeforeUnmount(() => {
  clearInterval(starCreatorTimer)
  isAnimating = false
  if (canvas && canvas.cancelAnimationFrame) {
    canvas.cancelAnimationFrame(animationFrameId)
  }
  else {
    window.cancelAnimationFrame(animationFrameId)
  }
})
// 初始化生成器
function startStarGeneration() {
  const createOne = () => {
    if (activeStars.value.length < props.maxStars) {
      activeStars.value.push(createNewStar())
    }
  }

  createOne()
  // 30秒一个实在太慢了，如果你是为了仪式感可以保持，调试时建议改快点
  starCreatorTimer = setInterval(createOne, 30000 + Math.random() * 1000)

  if (!isAnimating) {
    isAnimating = true
    renderLoop()
  }
}

// --- 生命周期 ---
onMounted(() => {
  const query = uni.createSelectorQuery().in(instance)
  query.select('#starCanvas')
    .fields({ node: true, size: true })
    .exec((res) => {
      if (!res[0])
        return

      const canvasNode = res[0].node
      const canvasCtx = canvasNode.getContext('2d')
      canvasWidth.value = res[0].width
      canvasHeight.value = res[0].height
      const dpr = uni.getWindowInfo().pixelRatio
      canvasNode.width = canvasWidth.value * dpr
      canvasNode.height = canvasHeight.value * dpr
      canvasCtx.scale(dpr, dpr)

      canvas = canvasNode
      ctx = canvasCtx

      startStarGeneration()
    })
})

onBeforeUnmount(() => {
  clearInterval(starCreatorTimer)
  isAnimating = false
})
</script>

<style scoped>
.star-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}
</style>
