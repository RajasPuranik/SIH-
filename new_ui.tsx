  const orbScale = 1 + (micVolume / 100) * 0.3;
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/95 backdrop-blur-3xl animate-fade-in font-sans">
      <div className="w-full h-full sm:h-[750px] sm:max-w-[420px] bg-slate-950 sm:rounded-[48px] overflow-hidden flex flex-col relative border border-slate-800/50 shadow-2xl">
        
        {/* TOP STATUS BAR */}
        <div className="absolute top-0 inset-x-0 p-8 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-white tracking-widest text-sm uppercase">Track AI</span>
          </div>
          {callState === 'connected' && (
            <div className="px-3 py-1 bg-slate-900/80 rounded-full text-xs font-medium text-slate-400 border border-slate-800">
              {formatTimer(callDuration)}
            </div>
          )}
        </div>

        {/* MAIN VISUAL AREA */}
        <div className="flex-1 flex flex-col items-center justify-center relative p-8 mt-10">
          
          {callState === 'incoming' && (
            <div className="flex flex-col items-center animate-fade-in-up">
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-4xl mb-8 animate-pulse">
                🏛️
              </div>
              <h2 className="text-2xl font-light text-white mb-2">Track AI</h2>
              <p className="text-slate-400 text-center text-sm px-4">Ready to assist with Mandi rates, tokens, and shipments.</p>
              
              <button 
                onClick={() => setCallState('calling')}
                className="mt-12 w-20 h-20 bg-emerald-600 rounded-full flex flex-col items-center justify-center text-white shadow-[0_0_40px_rgba(5,150,105,0.4)] animate-bounce"
              >
                <Phone className="w-8 h-8" />
              </button>
            </div>
          )}

          {callState === 'calling' && (
            <div className="flex flex-col items-center animate-fade-in">
              <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center animate-ping">
                  <Phone className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <h3 className="mt-8 text-xl font-light text-white">Connecting...</h3>
              <p className="text-slate-500 text-sm mt-2">Establishing secure link</p>
              
              {/* Auto connect after 2s simulate */}
              {setTimeout(() => { if(callStateRef.current === 'calling') connectCall('hi'); }, 2000) && null}
            </div>
          )}

          {callState === 'connected' && (
            <div className="flex flex-col items-center w-full h-full justify-center">
              
              {/* THE ORB */}
              <div className="relative flex items-center justify-center w-48 h-48 mb-12">
                {/* Outer Glow */}
                <div 
                  className={\`absolute inset-0 rounded-full blur-3xl transition-all duration-300 \${
                    isProcessingAudio ? 'bg-purple-600/40' :
                    isBotSpeaking ? 'bg-blue-500/40' : 
                    isUserSpeaking ? 'bg-emerald-500/40' : 'bg-slate-700/20'
                  }\`}
                  style={{ transform: \`scale(\${orbScale * 1.2})\` }}
                />
                
                {/* Core Sphere */}
                <div 
                  className={\`relative w-36 h-36 rounded-full flex items-center justify-center overflow-hidden transition-all duration-500 \${
                    isProcessingAudio ? 'bg-gradient-to-tr from-purple-700 to-pink-500 animate-pulse' :
                    isBotSpeaking ? 'bg-gradient-to-tr from-blue-600 via-cyan-500 to-blue-400' : 
                    isUserSpeaking ? 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300' : 
                    'bg-gradient-to-tr from-slate-800 to-slate-700'
                  }\`}
                  style={{ transform: \`scale(\${orbScale})\` }}
                >
                  <div className="absolute inset-0 bg-white/10 blur-xl mix-blend-overlay rounded-full" />
                  
                  {/* Subtle inner animated ring for speaking */}
                  {isBotSpeaking && (
                    <div className="absolute inset-0 rounded-full border-[6px] border-white/20 border-t-white/60 animate-spin-slow" />
                  )}
                  {isUserSpeaking && (
                    <div className="absolute inset-0 rounded-full border-[4px] border-emerald-200/30 scale-90" />
                  )}
                </div>
              </div>

              {/* TRANSCRIPT AREA */}
              <div className="h-32 w-full flex flex-col items-center justify-start text-center px-6">
                {currentSpeechTranscript ? (
                  <p className="text-xl font-light text-slate-300 animate-fade-in-up">
                    "{currentSpeechTranscript}"
                  </p>
                ) : isProcessingAudio ? (
                  <p className="text-lg font-light text-purple-400 animate-pulse">Thinking...</p>
                ) : isBotSpeaking ? (
                   <p className="text-xl font-light text-white animate-fade-in-up">
                     {lastMessage?.text.length > 90 ? lastMessage?.text.substring(0, 90) + '...' : lastMessage?.text}
                   </p>
                ) : (
                  <p className="text-lg font-light text-slate-500">Listening...</p>
                )}
              </div>
            </div>
          )}

          {callState === 'ended' && (
            <div className="flex flex-col items-center animate-fade-in-up">
              <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center text-3xl mb-6">
                📞
              </div>
              <h3 className="text-xl font-light text-white mb-2">Call Ended</h3>
              <p className="text-slate-500">Duration: {formatTimer(callDuration)}</p>
            </div>
          )}

        </div>

        {/* BOTTOM CONTROLS */}
        {callState === 'connected' && (
          <div className="w-full flex flex-col bg-slate-900/80 backdrop-blur-lg border-t border-slate-800/50 pb-8 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
            
            {/* Quick Actions (only show if keyboard isn't open and bot gave some) */}
            {!showKeypad && lastMessage?.quickActions && (
              <div className="flex gap-2 overflow-x-auto p-4 no-scrollbar">
                {lastMessage.quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleUserUtterance(action.action)}
                    className="shrink-0 px-4 py-2.5 bg-slate-800/80 hover:bg-emerald-900/40 text-emerald-100 text-sm font-medium rounded-2xl border border-slate-700/50 transition whitespace-nowrap"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* DTMF Keypad Drawer */}
            {showKeypad && (
              <div className="p-4 animate-slide-up bg-slate-900/50 border-b border-slate-800/50">
                <div className="text-xs text-slate-400 text-center mb-4 font-mono tracking-widest">
                  LANG: 1=ENG | 2=HIN | 3=MAR
                </div>
                <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                    <button
                      key={k}
                      onClick={() => handleKeypadPress(k)}
                      className="h-12 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-emerald-600 text-white font-medium text-lg transition cursor-pointer border border-slate-700/50"
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="px-8 py-4 flex items-center justify-between">
              
              <button
                onClick={() => setShowKeypad(!showKeypad)}
                className={\`w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer \${
                  showKeypad ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }\`}
              >
                <Grid className="w-5 h-5" />
              </button>

              <button
                onClick={toggleMute}
                className={\`w-16 h-16 rounded-full flex items-center justify-center transition cursor-pointer shadow-xl \${
                  isMuted
                    ? 'bg-amber-600/20 text-amber-500 border border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                }\`}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              <button
                onClick={endCall}
                className="w-12 h-12 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition cursor-pointer border border-red-500/20"
              >
                <PhoneOff className="w-5 h-5" />
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
