import DT from 'duration-time-conversion'
import clamp from 'lodash/clamp'
import { OPTION } from '@/config/OPTION'
import { generateUUID } from '@/lib/index'
import type { RawSub } from '@/config'

export class Sub {
  _id: string
  start: string
  end: string
  text: string
  text2: string
  preset?: string

  constructor({
    _id = '',
    start = '',
    end = '',
    text = '',
    text2 = '',
    startTime = null,
    endTime = null,
  }: RawSub) {
    this._id = _id || generateUUID()
    this.start = start
    this.end = end
    const { MAX_SUB_WORD } = OPTION
    this.text = text.slice(0, MAX_SUB_WORD)
    this.text2 = text2.slice(0, MAX_SUB_WORD)
    if (typeof startTime === 'number') this.startTime = startTime
    if (typeof endTime === 'number') this.endTime = endTime
  }

  static get tmp() {
    return new Sub({ startTime: 0, endTime: 1, text: 'text' })
  }

  merge(sub: Sub): Sub {
    this.text = `${this.text.trim()}\n${sub.text.trim()}`
    this.text2 = `${this.text2.trim()}\n${sub.text2.trim()}`
    this.start = DT.d2t(Math.min(this.startTime, sub.startTime))
    this.end = DT.d2t(Math.max(this.endTime, sub.endTime))
    return this
  }

  get check(): boolean {
    const { MAX_SUB_WORD } = OPTION
    return (
      this.startTime >= 0
      && this.endTime >= 0
      && this.startTime < this.endTime
      && this.text.length <= MAX_SUB_WORD
      && this.text2.length <= MAX_SUB_WORD
    )
  }

  get clone(): Sub {
    return new Sub(this)
  }

  get startTime(): number {
    return DT.t2d(this.start)
  }

  set startTime(time: number) {
    this.start = DT.d2t(clamp(time, 0, Infinity))
  }

  get endTime(): number {
    return DT.t2d(this.end)
  }

  set endTime(time: number) {
    this.end = DT.d2t(clamp(time, 0, Infinity))
  }

  get duration(): number {
    return Number.parseFloat((this.endTime - this.startTime).toFixed(3))
  }
}
