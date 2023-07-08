import React,{useEffect,useRef} from 'react';
import '@tensorflow/tfjs-backend-cpu';
//import {Howl} from 'howler';
import * as mobilenet from '@tensorflow-models/mobilenet'
import * as knnClassifier from '@tensorflow-models/knn-classifier'
import './App.css';
// import soundURL from './assets/hey_sondn.mp3'

// var sound = new Howl({
//   src: [soundURL]
// });

//sound.play();
const NOT_TOUCH_LABEL = 'not_touch'
const TOUCHED_LABEL = 'touched'
const TRAINING_TIMES = 50

function App() {
  const video = useRef()
  const classifier = useRef()
  const mobilenetModule = useRef()
  const TOUCH_CONFIDENCE = 0.8

  const init = async() => {
    console.log('init...')
      await setupCamera()
      console.log('setup camera success...')
       classifier.current = knnClassifier.create();
       mobilenetModule.current = await mobilenet.load();
       console.log('Setup done')
       console.log('Không chạm tay lên mặt và ấn train 1')
  }

  const setupCamera = () => {
      return new Promise((resolve, reject) => {
          navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia  

            if (navigator.getUserMedia) {
                navigator.getUserMedia(
                  {video: true},
                  stream=>{
                      video.current.srcObject = stream
                      video.current.addEventListener('loadeddata',resolve)
                  },
                  error=>reject(error)
                )
            } else {
              reject()
            }
        })
  }

  const train = async label => {
    console.log(`[${label}] Đang train cho máy mặt đẹp trai của bạn...`)
    for (let i=0; i<TRAINING_TIMES; i++) {
      console.log(`Progress ${parseInt((i+1)/TRAINING_TIMES)}%`)
      await training(label)
    }
  }
  
  const training = label => {
    return new Promise(async resolve => {
        const embedding = mobilenetModule.current.infer(video.current, true)
        classifier.current.addExample(embedding, label)
        await sleep(100)
        resolve()
    })
  }

  const run = async() => {
    const embedding = mobilenetModule.current.infer(video.current, true)
    
  const result = classifier.current.predictClass(embedding)
  if (result.label === TOUCHED_LABEL && result.confidences[result.label] > TOUCH_CONFIDENCE) {
        console.log('Touched')
  } else {
      console.log('Not touched')
  }
  await sleep(200)
  run()
  }

  const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve,ms))
  }

  useEffect(()=> {
      init()
      return () => {}
  }, [])

  return (
    <div className="main">
    <video
        ref={video}
        className = "video"
        autoPlay
        />

    <div className='control'>
        <button className='btn' onClick={()=>train(NOT_TOUCH_LABEL)}>Train 1</button>
        <button className='btn' onClick={()=>train(TOUCHED_LABEL)}>Train 2</button>
        <button className='btn' onClick={()=>run()}>Run</button>
    </div>

    </div>

  );
}

export default App;
