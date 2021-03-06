import React from 'react';
import style from './style.module.less';
import SVGinline from 'components/SVGinline';
import logo from 'graphics/logo.svg';
import { map, forEach } from 'lodash';
import Kiste from 'components/Kiste';
import SetInnerHTML from 'components/SetInnerHTML'
import classNames from 'classnames';

import fisch from 'graphics/illustrations/fisch1.png'

const TYPING_SPEED = 40;
const TYPING_STEPS = 100;
const IMG_URL = 'graphics/illustrations/';
const MOBILE_WIDTH = 700;

export default class Intro extends React.Component {
    constructor(props) {
        super(props);
        this.boundScroll = this.onScroll.bind(this);
        this.fishEls = [];

        this.state = {
            scroll: this.getScrollPosition()
        };
    }
    render() {
        const { children, fishes } = this.props;
        const kisteAtBottom = isAtBottom(this.containerEl, this.state.scroll);
        const { raiseArm, activeFish } = shouldRaiseArm(this.kisteEl, this.fishEls, this.state.scroll);
        const sloganColor = {color: this.getSloganColor(this.state.scroll)};
        const noJs = typeof window === 'undefined';

        return (
            <div ref={(c) => this.containerEl = c}
                    className={style.container}>
                <section className={style.top}>
                    <div className={style.inner}
                            style={sloganColor}>
                        <img src={logo} 
                            className={style.logo} />
                        <div className={style.slogan}>
                            { children }
                        </div>
                    </div>
                </section>
                { map(fishes, (fish, idx) => {
                        return (
                            <Fish fish={fish}
                                ref={(c) => this.fishEls[idx] = c}
                                key={idx}
                                isActive={idx <= activeFish} />
                        )
                    })
                }
                <div className={classNames(style.scroll_hint, {[style.scroll_hint__active]: this.state.scroll === 0})}>
                    <div>~</div>
                    <div>~</div>
                    <div>~</div>
                </div>
                <div className={classNames(
                            style.kiste, {
                                [style.kiste__bottom]: kisteAtBottom,
                                [style.kiste__noJs]: noJs,
                                [style.kiste__raising]: raiseArm,
                            })}
                        ref={(c) => this.kisteEl = c}>
                    <Kiste raiseArm={raiseArm}/>
                </div>
            </div>
        )
    }

    getSloganColor(scroll) {
        const c = 255 - Math.min(Math.max(scroll, 0), 255);
        return 'rgb(' + c + ',' + c + ',' + c + ')'
    }

    onScroll() {
        const scrollPosition = this.getScrollPosition();
        this.setState({
            scroll: scrollPosition
        })
    }

    getScrollPosition() {
        if (typeof window === 'undefined') {
            return 0;
        } else {
            const doc = document.documentElement;
            return (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
        }
    }

    componentDidMount() {
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', this.boundScroll);
        }
    }

    componentWillUnmount() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('scroll', this.boundScroll);
        }
    }
}

class Fish extends React.Component {
    constructor(props) {
        super(props);
        this.text = typeof window === 'undefined' ? '' : stripHTML(props.fish.body).split('');

        this.state = {
            written: 0
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.isActive !== nextProps.isActive) {
            if (nextProps.isActive) {
                this.typeLetter(0)
            } else {
                this.setState({
                    written: 0
                })
                clearTimeout(this.timer)
            }
        }
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
    }

    typeLetter(written) {
        if (written <= TYPING_STEPS) {
            const newWritten = written + 1;
            this.setState({
                written: newWritten
            })
            this.timer = setTimeout(() => {
                this.typeLetter(newWritten)
            }, TYPING_SPEED)
        }
    }

    render() {
        const { fish, isActive } = this.props;
        let image;

        if (fish.image) {
            const url = require('graphics/illustrations/' + fish.image + '.gif');
            image = <div className={style.fish_image} style={getBackgroundStyle(url)} />
        } else if (fish.images) {
            image = (
                <div className={classNames(style.fish_image, {[style.fish_image__many]: fish.images.length > 3}, {[style.fish_image__few]: fish.images.length <= 3})}>
                    { map(fish.images, (image) => {
                        return <div key={image} style={getBackgroundStyle(require('graphics/illustrations/' + image))} />
                    })}                    
                </div>
            )
        }

        return (
            <div className={classNames(style.fish, {[style.fish__active]: isActive})}
                    ref={(c) => this.fishEl = c}>
                <div className={style.fish_container}>
                    <div className={style.fish_container_inner}>
                        <div className={style.fish_image_container}>
                            { image }
                        </div>
                        <div className={style.fish_description}>
                            <h2 className={style.fish_heading}>{fish.title}</h2>
                            { typeof window === 'undefined' ?
                                <SetInnerHTML body={fish.body} /> :
                                <p>
                                    {
                                        map(this.text, (letter, idx) => {
                                            const active = idx / this.text.length < this.state.written / TYPING_STEPS;
                                            return (
                                                <span style={ {visibility: active ? 'visible' : 'hidden'} }
                                                        key={idx}>
                                                    { letter }
                                                </span>
                                            )
                                        })
                                    }
                                </p>
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function isAtBottom(el, scrollPosition) {
    if (el) {
        return (el.offsetTop + el.offsetHeight) < (scrollPosition + window.innerHeight);
    }
}

function shouldRaiseArm(kiste, fishes, scrollTop) {
    if (kiste) {
        const centerKiste = scrollTop + kiste.offsetTop + (kiste.offsetHeight / 2);
        let raiseArm = undefined;
        let activeFish = undefined;

        forEach(fishes, (fish, idx) => {
            const el = fish.fishEl;
            const top = el.offsetTop;
            const bottom = top + el.offsetHeight;
            if (top < centerKiste && bottom > centerKiste) {
                activeFish = idx;
                raiseArm = idx % 2 ? 'L' : 'R';
                return false;
            }
        })

        return { raiseArm, activeFish };
    } else {
        return {};
    }
}

function getBackgroundStyle (file) {
    return { backgroundImage: 'url(' + file + ')' }
}

function stripHTML(html) {
   const tmp = document.createElement('DIV');
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || '';
}