"""Original, deterministic workshop sound designs. NumPy + ffmpeg; no recordings/licenses.
Run manually when editing sounds. Committed Ogg files are used directly by the site.
"""
from pathlib import Path
import numpy as np
import subprocess, wave, tempfile
RATE=24000; SECONDS=12; N=RATE*SECONDS; t=np.arange(N)/RATE
rng=np.random.default_rng(417)
f=np.fft.rfftfreq(N,1/RATE)
def noise(center,width):
    spectrum=(rng.normal(size=len(f))+1j*rng.normal(size=len(f)))*np.exp(-((f-center)/width)**2)
    v=np.fft.irfft(spectrum,n=N);return v/max(np.std(v),1e-9)
def tone(hz):return np.sin(2*np.pi*hz*t)
def events(times,hz=900,decay=40,strength=.2):
    result=np.zeros(N)
    for start in times:
        age=(t-start)%SECONDS
        result+=strength*np.exp(-age*decay)*(np.sin(2*np.pi*hz*age)+.4*np.sin(2*np.pi*hz*2.37*age))
    return result
low=noise(170,160); air=noise(1600,1400); grind=noise(2800,2200)
pulse=lambda hz: .5+.5*np.sin(2*np.pi*hz*t)
tracks={
'cooling':.12*low+.09*air+.04*tone(60)+.025*noise(650,600)*pulse(2),
'electrical':.065*tone(100)+.02*tone(200)+.015*low+events([1.2,4.1,7.8,10.4],1300,85,.2),
'mechanical':.08*tone(45)+.035*tone(90)+.09*low*(.65+.35*pulse(4))+events(np.arange(.4,12,1.5),220,20,.1),
'fabrication':.08*low+.12*grind*pulse(.25)**8+events([.7,1,3.8,4.1,7,9.5],750,9,.22),
'civil':.08*low+.12*grind*pulse(.5)**10*(.6+.4*pulse(35))+events([1,1.4,1.8,5,5.4,8.5,9],170,18,.25),
'fire':.055*tone(50)+.08*low+.11*air*pulse(1/6)**12+events([3,9],520,35,.12),
'it':.09*air+.025*tone(240)+events([.3,.42,.6,2.8,3,3.2,6,6.15,6.5,9.2],1700,140,.1),
'manufacturing':.06*low+.045*np.sin(2*np.pi*160*t+8*np.sin(2*np.pi*.5*t))+events(np.arange(.2,12,.75),360,22,.17),
'industry':.04*air+.025*low+events([1,3.2,5.4,7.6,10],1200,25,.08),
'iiot':.045*air+.025*tone(120)+events(np.arange(.5,12,1.5),1800,45,.07),
'vision':.05*low+.035*tone(90)+events(np.arange(.3,12,1),620,45,.14)+events(np.arange(.6,12,1),2200,80,.07),
}
root=Path('public/assets/audio');root.mkdir(parents=True,exist_ok=True)
for name,samples in tracks.items():
    samples=np.tanh(samples)*.75
    with tempfile.NamedTemporaryFile(suffix='.wav') as temp:
        with wave.open(temp.name,'wb') as out:
            out.setnchannels(1);out.setsampwidth(2);out.setframerate(RATE);out.writeframes((samples*32767).astype('<i2').tobytes())
        subprocess.run(['ffmpeg','-v','error','-y','-i',temp.name,'-c:a','libvorbis','-q:a','3',str(root/(name+'.ogg'))],check=True)
    print(name, 'peak',round(float(abs(samples).max()),3),'rms',round(float(np.sqrt(np.mean(samples*samples))),3))
