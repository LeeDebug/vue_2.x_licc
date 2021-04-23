/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0

export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++

    // 初始化过程性能度量，开始处，可无视 By. Lee
    // let startTag, endTag
    // /* istanbul ignore if */
    // if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    //   startTag = `vue-perf-start:${vm._uid}`
    //   endTag = `vue-perf-end:${vm._uid}`
    //   mark(startTag)
    // }

    // a flag to avoid this being observed
    vm._isVue = true
    // * 处理组件配置项 By. Lee
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      // * 子组件：性能优化，减少原型链的动态查找，提高执行效率 By. Lee
      initInternalComponent(vm, options)
    } else {
      // * 根组件走这里：选项合并，将全局配置选项合并到根组件的局部配置上 By. Lee
      // 例如，Vue.component('name', { ... }) 会被合并到 Vue跟实例上的 components:{ ..., name } 对象中 By. Lee
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    // 初始化过程性能度量，结束处，可无视 By. Lee
    // /* istanbul ignore if */
    // if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    //   vm._name = formatComponentName(vm, false)
    //   mark(endTag)
    //   measure(`vue ${vm._name} init`, startTag, endTag)
    // }

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

// * 性能优化，打平配置对象上的属性，减少运行时的原型链查找，提高执行效率 By. Lee
export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  // 基于 组件构造函数上的配置对象（vm.constructor.options）创建vm.$options新对象  By. Lee
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  // 如果有 render 函数，将其赋值到 vm.$options By. Lee
  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

// * 从构造函数上解析配置项 By. Lee
export function resolveConstructorOptions (Ctor: Class<Component>) {
  // 从实例构造函数上获取选项 By. Lee
  let options = Ctor.options
  // 有super属性，说明有基类 By. Lee
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super)
    // 缓存 By. Lee
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // 说明基类的配置项发生了更改 By. Lee
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      // 找到更改的选项 By. Lee
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        // 将 更改的选项 和 extend选项 合并 By. Lee
        extend(Ctor.extendOptions, modifiedOptions)
      }
      // 将 新的选项 赋值给 options By. Lee
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}
