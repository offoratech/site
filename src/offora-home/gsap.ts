import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, useGSAP)

// One signature curve used for every reveal: fast out, long settle.
CustomEase.create('offora', 'M0,0 C0.16,1 0.3,1 1,1')

export const MOTION_OK = '(prefers-reduced-motion: no-preference)'
export const EASE = 'offora'
export const isTouch = () => window.matchMedia('(hover: none), (pointer: coarse)').matches

export { gsap, ScrollTrigger, SplitText, useGSAP }
