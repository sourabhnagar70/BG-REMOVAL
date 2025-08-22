import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/Appcontext'

const Result = () => {
  const { resultImage, image } = useContext(AppContext)

  return (
    <div className='mx-4 my-3 lg:mx-44 mt-14 min-h-[70vh]'>
      <div className='bg-white rounded-lg px-8 py-6 drop-shadow-sm'>
        {/*----image container-------*/}
        <div className='flex flex-col sm:grid grid-cols-2 gap-8'>
          {/*-----left side----*/}
          <div>
            <p className='font-semibold text-gray-600 mb-2'>Original</p>
            {/* Fixed: Only render img when image exists */}
            {image ? (
              <img 
                className='rounded-md border' 
                src={URL.createObjectURL(image)} 
                alt="Original image" 
              />
            ) : (
              <div className='rounded-md border border-gray-300 h-64 flex items-center justify-center bg-gray-50'>
                <p className='text-gray-500'>No image selected</p>
              </div>
            )}
          </div>
          
          {/*-----right side----*/}
          <div className='flex flex-col'>
            <p className='font-semibold text-gray-600 mb-2'>Background Removed</p>
            <div className='rounded-md border border-gray-300 h-full relative bg-layer overflow-hidden'>
              {/* Fixed: Only render img when resultImage exists */}
              {resultImage && (
                <img src={resultImage} alt="Background removed image" />
              )}
              
              {/* Loading spinner - only show when processing */}
              {!resultImage && image && (
                <div className='absolute right-1/2 bottom-1/2 transform translate-x-1/2 translate-y-1/2'>
                  <div className='border-4 border-violet-600 rounded-full h-12 w-12 animate-spin border-t-transparent'></div>
                </div>
              )}
              
              {/* Placeholder when no image and no processing */}
              {!resultImage && !image && (
                <div className='h-64 flex items-center justify-center'>
                  <p className='text-gray-500'>Processed image will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/*------Buttons------*/}
        {resultImage && (
          <div className='flex justify-center sm:justify-end items-center flex-wrap gap-4 mt-6'>
            <button className='px-8 py-2.5 text-violet-600 text-sm border border-violet-600 rounded-full hover:scale-105 transition-all duration-700'>
              Try another image
            </button>
            <a 
              href={resultImage} 
              download 
              className='px-8 py-2.5 text-white text-sm bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full hover:scale-105 transition-all duration-700'
            >
              Download image
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default Result
