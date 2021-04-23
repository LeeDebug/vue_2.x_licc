import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// ! vue 构造函数 入口 By. Lee
function Vue (options) {

  // 开发环境的提示代码，可无视 By. Lee
  // if (process.env.NODE_ENV !== 'production' &&
  //   ！(this instanceof Vue) // 取消注释后，中文！换为英文!
  // ) {
  //   warn('Vue is a constructor and should be called with the `new` keyword')
  // }

  // 调用 initMixin() 里的 Vue.prototype._init 方法 By. Lee
  this._init(options)
}

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
