// Purely decorative animated background stars.
// Pulled out of App.jsx because it's static markup with no logic —
// keeping it separate stops it from cluttering the component that
// actually holds state.
function Background() {
  return (
    <div className="bg-glow" aria-hidden="true">
      <span className="bg-star star-lg s1" />
      <span className="bg-star star-sm s2" />
      <span className="bg-star star-sm s3" />
      <span className="bg-star star-lg s4" />
      <span className="bg-star star-sm s5" />
      <span className="bg-star star-sm s6" />
      <span className="bg-star star-lg s7" />
      <span className="bg-star star-sm s8" />
      <span className="bg-star star-sm s9" />
      <span className="bg-star star-lg s10" />
      <span className="bg-star star-sm s11" />
      <span className="bg-star star-sm s12" />
      <span className="bg-star star-xl star-pink s13" />
      <span className="bg-star star-xl star-green s14" />
      <span className="bg-star star-xl star-blue s15" />
      <span className="bg-star star-xl star-yellow s16" />
      <span className="bg-star star-md s17" />
      <span className="bg-star star-md s18" />
      <span className="bg-star star-md s19" />
      <span className="bg-star star-md s20" />
      <span className="bg-star star-lg star-pink s21" />
      <span className="bg-star star-lg star-green s22" />
      <span className="bg-star star-lg star-blue s23" />
      <span className="bg-star star-lg star-yellow s24" />
      <span className="bg-star star-sm s25" />
      <span className="bg-star star-sm s26" />
      <span className="bg-star star-xl star-pink s27" />
      <span className="bg-star star-xl star-green s28" />
      <span className="bg-star star-xl star-blue s29" />
      <span className="bg-star star-xl star-yellow s30" />
    </div>
  )
}

export default Background
