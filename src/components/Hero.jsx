import React from "react"

import Nav from "./Nav"

const Hero = () => {
	return (
		<>
			<div className='w-full flex justify-center items-center flex-col'>
				<Nav />
			</div>
			<div className='w-full flex justify-center items-center flex-col'>
				<h1 className='head_text'>
					<span className='orange_gradient '></span>
					<br />
					<span className='description'>Analyze Medical Reports</span>
				</h1>
				<h2 className='desc'>
				The medical report analysis tool that gives you the ability to make well-informed decisions regarding your health journey.
				</h2>
			</div>
		</>
	)
}

export default Hero
