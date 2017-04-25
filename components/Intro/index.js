import React from 'react';
import style from './style.module.less';
import SVGinline from 'components/SVGinline';
import logo from '!svg-inline-loader!graphics/logo.svg';
import { map, forEach } from 'lodash';
import Kiste from 'components/Kiste';
import SetInnerHTML from 'components/SetInnerHTML'
import classNames from 'classnames';

import fisch from 'graphics/illustrations/fisch1.png'

const TYPING_SPEED = 20;
const IMG_URL = 'graphics/illustrations/'

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
        const raiseArm = shouldRaiseArm(this.kisteEl, this.fishEls, this.state.scroll);
        const noJs = typeof window === 'undefined';

        return (
            <div ref={(c) => this.containerEl = c}
                    className={style.container}>
                <section className={style.top}>
                    <div className={style.inner}>
                        <SVGinline svg={logo} 
                            className={style.logo} />
                        { children }
                    </div>
                </section>
                { map(fishes, (fish, idx) => {
                        return (
                                <Fish fish={fish}
                                    ref={(c) => this.fishEls[idx] = c}
                                    key={idx}
                                    scrollPosition={this.state.scroll} />
                        )
                    })
                }
                <div className={classNames(
                            style.kiste, {
                                [style.kiste__bottom]: kisteAtBottom,
                                [style.kiste__noJs]: noJs,
                            })}
                        ref={(c) => this.kisteEl = c}>
                    <Kiste raiseArm={shouldRaiseArm(this.kisteEl, this.fishEls, this.state.scroll)}/>
                </div>
            </div>
        )
    }

    onScroll() {
        const scrollPosition = this.getScrollPosition();
        this.setState({
            scroll: scrollPosition
        })
    }

    getScrollPosition() {
        return typeof window === 'undefined' ? 0 : window.scrollY;
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

        this.state = {
            text: '',
            inView: typeof window === 'undefined'
        };
    }

    componentWillReceiveProps(nextProps) {
        const inView = isInView(this.fishEl, nextProps.scrollPosition);

        if (inView !== this.state.inView) {
            this.setState({
                inView: inView
            });

            if (inView) {
                this.typeLetter(stripHTML(nextProps.fish.body).split(''))
            } else {
                this.setState({
                    text: ''
                })
                clearTimeout(this.timer)
            }
        } 
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
    }

    typeLetter(text) {
        if (text.length !== 0) {
            this.setState({
                text: this.state.text + text.shift()
            })
            this.timer = setTimeout(() => {
                this.typeLetter(text)
            }, TYPING_SPEED)
        }
    }

    render() {
        const { fish, scrollPosition } = this.props;
        const url = require('graphics/illustrations/' + fish.image);
        const fishStyle = { backgroundImage: 'url(' + url + ')' };

        return (
            <div className={classNames(style.fish, {[style.fish__active]: this.state.inView})}
                    ref={(c) => this.fishEl = c}>
                <div className={style.fish_container}>
                    <div className={style.fish_container_inner}>
                        <div className={style.fish_image} style={fishStyle} />
                        <div className={style.fish_description}>
                            {fish.title}
                            { typeof window === 'undefined' ?
                                <SetInnerHTML body={fish.body} /> :
                                <p>{this.state.text}</p>
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function isInView(el, scrollPosition) {
    if (el) {
        return el.offsetTop < (scrollPosition + window.innerHeight);
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
        let raise = undefined;

        forEach(fishes, (fish, idx) => {
            const el = fish.fishEl;
            const top = el.offsetTop;
            const bottom = top + el.offsetHeight;
            if (top < centerKiste && bottom > centerKiste) {
                raise = idx % 2 ? 'L' : 'R';
                return false;
            }
        })

        return raise;
    }
}


function stripHTML(html) {
   const tmp = document.createElement('DIV');
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || '';
}