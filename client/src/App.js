import AsteroidTracker from './components/Three-JS-Render/AsteroidTracker';
import styles from "./index.css"
const App = () => {
  return <>
        <div class="relative h-64 bg-gradient-to-r
                from-blue-400 to-purple-500">
        
        {/* 3d Scene */}
        <div class="absolute inset-0 z-10"><AsteroidTracker /></div>

        {/* UI overlay */}
        <div class="absolute inset-0 flex 
                    items-center justify-center
                    text-white z-20">
            <div>
                    kjsdf
            </div>
        </div>
    </div>
    </>
;
}


export default App;
