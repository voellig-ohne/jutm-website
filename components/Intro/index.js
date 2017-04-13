import React from 'react';
import style from './style.module.less';
import SVGinline from 'components/SVGinline';
import logo from '!svg-inline-loader!graphics/logo.svg';
import Kiste from 'components/Kiste'

export default class Intro extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { children, fishes } = this.props;
        console.log('fishes', fishes)

        return (
            <div>
                <section className={style.container}>
                    <div className={style.inner}>
                        <SVGinline svg={logo} 
                            className={style.logo} />
                        { children }
                    </div>
                </section>
                <div className={style.kiste}>
                    <Kiste />
                </div>
            </div>
        )
    }
}