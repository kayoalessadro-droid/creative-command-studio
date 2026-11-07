import asyncio, math, os, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw
import edge_tts

W,H,FPS,DURATION=720,1280,24,95
OUT=Path("output"); OUT.mkdir(exist_ok=True)
VOICE="pt-BR-AntonioNeural"
NARRATION="""E se você pudesse ficar invisível por um minuto inteiro?
O Nico descobriu isso do jeito mais estranho possível. Ele estava sozinho no quarto quando olhou para as próprias mãos… e elas começaram a desaparecer.
Primeiro os dedos. Depois os braços. Em poucos segundos, não conseguia mais enxergar o próprio corpo. Mas ainda sentia tudo. O coração acelerado, os pés no chão… e uma ideia perigosa surgindo na cabeça.
Ele saiu do quarto sem fazer barulho. A mãe passou pelo corredor e não percebeu nada. Nico estava invisível.
No começo, parecia perfeito. Ele atravessou a sala, pegou um pacote de biscoitos e voltou sem ninguém entender como aquilo tinha acontecido.
Só que então resolveu testar o poder do lado de fora.
Na rua, passou por algumas pessoas. Ninguém conseguia vê-lo. Mas, quando esbarrou sem querer no ombro de um homem, o homem sentiu o impacto e virou assustado, procurando quem tinha batido nele.
Foi aí que Nico percebeu: invisível não significava intocável.
E o pior ainda estava por vir.
Uma contagem começou na cabeça dele. Cinquenta segundos… quarenta… trinta…
Ele tentou voltar para casa correndo. Os passos ainda faziam barulho. Uma bicicleta desviou de algo que não conseguia enxergar. Um cachorro começou a latir e seguiu Nico com os olhos.
Dez segundos.
Nico chegou à porta. Cinco… quatro… três…
A invisibilidade acabou.
Mas, quando olhou para trás, viu o homem da rua parado no outro lado da calçada. Ele não estava olhando para o lugar onde Nico tinha aparecido.
Estava olhando exatamente para o caminho que Nico tinha percorrido.
Como aquele homem conseguiu acompanhar alguém que ninguém podia enxergar?"""

def lerp(a,b,t): return a+(b-a)*max(0,min(1,t))
def draw_person(d,x,y,alpha=255,scale=1,pose=0,shirt=(35,120,210)):
    if alpha<=0:return
    c=lambda rgb:(*rgb,alpha)
    s=scale
    # legs and shoes
    d.line((x-12*s,y+45*s,x-18*s,y+83*s),fill=c((35,40,58)),width=max(2,int(9*s)))
    d.line((x+12*s,y+45*s,x+19*s,y+83*s),fill=c((35,40,58)),width=max(2,int(9*s)))
    d.ellipse((x-31*s,y+76*s,x-7*s,y+87*s),fill=c((25,28,39)))
    d.ellipse((x+8*s,y+76*s,x+32*s,y+87*s),fill=c((25,28,39)))
    d.rounded_rectangle((x-23*s,y+3*s,x+23*s,y+53*s),radius=int(10*s),fill=c(shirt))
    d.line((x-20*s,y+15*s,x-34*s,y+42*s),fill=c((224,166,126)),width=max(2,int(8*s)))
    d.line((x+20*s,y+15*s,x+32*s,y+40*s),fill=c((224,166,126)),width=max(2,int(8*s)))
    d.ellipse((x-22*s,y-43*s,x+22*s,y+4*s),fill=c((224,166,126)))
    d.pieslice((x-24*s,y-48*s,x+24*s,y-1*s),180,360,fill=c((45,31,28)))
    d.ellipse((x-10*s,y-24*s,x-5*s,y-19*s),fill=c((25,25,30)))
    d.ellipse((x+5*s,y-24*s,x+10*s,y-19*s),fill=c((25,25,30)))
    d.arc((x-8*s,y-18*s,x+8*s,y-7*s),0,180,fill=c((90,42,35)),width=max(1,int(2*s)))

async def main():
    audio=OUT/"narracao.mp3"
    await edge_tts.Communicate(NARRATION,VOICE,rate="+2%",pitch="+0Hz").save(str(audio))
    cmd=["ffmpeg","-y","-loglevel","error","-f","rawvideo","-pix_fmt","rgb24","-s",f"{W}x{H}","-r",str(FPS),"-i","-","-i",str(audio),"-map","0:v","-map","1:a","-c:v","libx264","-preset","veryfast","-crf","20","-pix_fmt","yuv420p","-c:a","aac","-b:a","160k","-shortest","-movflags","+faststart",str(OUT/"aurax-invisibilidade.mp4")]
    p=subprocess.Popen(cmd,stdin=subprocess.PIPE)
    try:
      for i in range(DURATION*FPS):
        t=i/FPS
        scene=min(9,int(t/9.5))
        im=Image.new("RGBA",(W,H),(13,20,39,255)); d=ImageDraw.Draw(im,"RGBA")
        # atmospheric gradient and scene-specific environment
        for yy in range(H):
          k=yy/H
          col=(int(lerp(18,5,k)),int(lerp(34,14,k)),int(lerp(61,36,k)),255)
          d.line((0,yy,W,yy),fill=col)
        # location changes
        if scene in (0,1,2,3): # bedroom / house
          d.rectangle((0,900,W,H),fill=(38,44,66,255))
          d.rectangle((65,220,655,900),outline=(86,111,151,255),width=5)
          d.rectangle((450,260,620,600),fill=(24,44,69,255),outline=(113,145,180,255),width=5)
          d.ellipse((90,760,360,825),fill=(62,72,98,255))
        else:
          d.rectangle((0,870,W,H),fill=(35,43,58,255))
          d.rectangle((0,850,W,870),fill=(84,97,113,255))
          for bx in range(35,720,120):
            d.rectangle((bx,500,bx+80,850),fill=(25,36,56,255))
            for wy in range(530,820,75):
              d.rectangle((bx+15,wy,bx+35,wy+28),fill=(219,188,111,150))
        # invisible for 60 sec, from 15s through 75s
        invis=15<=t<75
        fade=1.0
        if 11<t<15: fade=(15-t)/4
        if 75<=t<78: fade=(t-75)/3
        alpha=0 if invis else int(255*max(0,min(1,fade)))
        x=int(lerp(120,570,(t%9.5)/9.5)) if scene not in (4,5,6,7,8,9) else int(lerp(80,640,((t-38)/57)%1))
        y=720+int(math.sin(t*3)*5)
        # subtle invisibility shimmer / moving clues
        if invis:
          for q in range(5):
            xx=int((x+q*63+t*45)%W); yy=int(670+math.sin(t*2+q)*100)
            d.ellipse((xx,yy,xx+5,yy+5),fill=(130,213,255,90))
          # floating biscuit packet while he holds it
          if 25<t<38:
            d.rounded_rectangle((x+25,y+5,x+100,y+65),radius=8,fill=(224,176,67,240),outline=(255,230,155,255),width=3)
        draw_person(d,x,y,alpha,1.35,shirt=(38,132,220))
        # man who feels the bump and later tracks his path
        if 48<t<95:
          mx=520; my=720
          draw_person(d,mx,my,255,1.55,shirt=(124,75,72))
          if 88<t:
            d.line((mx-60,my-70,x,y),fill=(246,194,105,100),width=2)
        # dog follows the invisible motion near the end
        if 70<t<86:
          dx=120+int((t-70)*15)
          d.ellipse((dx-30,840,dx+35,895),fill=(170,117,73,255))
          d.ellipse((dx+18,820,dx+62,867),fill=(170,117,73,255))
          d.ellipse((dx+42,838,dx+49,845),fill=(20,20,20,255))
          d.line((dx-18,880,dx-24,910),fill=(95,62,43,255),width=7)
          d.line((dx+20,880,dx+26,910),fill=(95,62,43,255),width=7)
        # countdown shown as diegetic glowing ring, not subtitles
        if 58<t<76:
          rem=max(0,75-t)
          d.arc((W-150,90,W-55,185),-90,-90+360*rem/17,fill=(104,218,255,210),width=8)
        # cinematic vignette
        frame=im.convert("RGB")
        p.stdin.write(frame.tobytes())
      p.stdin.close()
      if p.wait()!=0: raise RuntimeError("FFmpeg failed")
    finally:
      if p.poll() is None:p.kill()
    print(f"VIDEO={OUT/'aurax-invisibilidade.mp4'}")
if __name__=="__main__": asyncio.run(main())
