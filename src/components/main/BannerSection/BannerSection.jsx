import { useNavigate } from 'react-router-dom'

import 복냥이 from '../../../assets/복냥이.png'
import img7 from '../../../assets/7.png'
import img3 from '../../../assets/3.png'
import img5 from '../../../assets/5.png'
import img6 from '../../../assets/6.png'
import 발바닥 from '../../../assets/발바닥.png'
import 수박냥이 from '../../../assets/수박냥이.png'
import 어항냥이 from '../../../assets/어항냥이.png'
import 빙냥이 from '../../../assets/빙냥이.png'
import 발 from '../../../assets/발.png'

import './BannerSection.scss'

function BannerSection() {
   const navigate = useNavigate()
   return (
      <section id="banner" className="container mt-5">
         <div className="galindo banner-title">
            2025
            <br />
            SUMMER
            <br />
            SEASON OFF SALE
         </div>
         <button className="bannerbtn" onClick={() => navigate('/items/search?filter=이벤트&filter=세일&filter=시즌오프')}>시즌 오프 특가 보러가기</button>
         <img className="img1" src={복냥이} alt="bannerimg" />
         <img className="img2" src={img7} alt="bannerimg" />
         <img className="img3" src={img3} alt="bannerimg" />
         <img className="img4" src={img5} alt="bannerimg" />
         <img className="img5" src={img6} alt="bannerimg" />
         <img className="img6" src={발바닥} alt="bannerimg" />
         <img className="img7" src={발바닥} alt="bannerimg" />
         <img className="img8" src={수박냥이} alt="bannerimg" />
         <img className="img9" src={어항냥이} alt="bannerimg" />
         <img className="img10" src={빙냥이} alt="bannerimg" />
         <div className="click">
            <img className="click-img" src={발} alt="bannerimg" />
            <p className="click-text">click!</p>
         </div>
      </section>
   )
}

export default BannerSection

