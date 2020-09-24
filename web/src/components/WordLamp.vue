<template>
    <div>
      {{word}}
    </div>
</template>

<script>
import {TweenMax,Elastic} from "gsap";

export default {
  name: "WordLamp",
  data:function(){
      return {
          words: [
            "为天下苍生，太沉重了。就为了自己，好吗？（奇经）",
            "天神的责任，就是守护世间正道。什么是正道？是不会随时代变迁的一种价值。乌云纵使有时会遮天蔽日。但黑的东西不会变成白。这是每个天神心中不变的价值和信念。与内心的领悟、灵性的提升无关……暗魂就是暗魂。暗魂就是没格调。有自尊自重的天神岂可与你为伍！",
            "对所有事情都保持中立，实则助长邪恶",
            "当生活压迫到你窒息的时候。每天就只有短暂的休息时间，可以忘记痛苦。",
            "无知是一切灾祸的根源",
            "打败我？这个条件太苛刻，几乎不可能做到。（罗睺）",
            "男人就该做一件轰轰烈烈的事。（猪八戒）",
            "我睡了十六年，这一句惊醒了我！我，睡够了！（唐三藏）",
            "人生就是一连串的遗憾，有些话我遗憾过去没有对你说，太迟了，现在什么也不必再说。（沙悟净）",
            "在云外天绕了一圈回来，应该不会太迟吧....（三眼神将）"
        ],
        wordprogress: 0,
        word: '',
      }
  },
  mounted: function () {
        function tweentext() {
            this.wordprogress = 0;
            var result = this.words[(Math.random() * this.words.length) >> 0];
            TweenMax.to(this, 1, { wordprogress: 1, onUpdate: updatetext.bind(this), onUpdateParams: [result], ease: Elastic.easeInOut });
        }
        function updatetext(result) {
            if (this.wordprogress == 1) {
                this.word = result;
                return;
            }
            var chartotal = this.word.length + ((((result.length - this.word.length)) * this.wordprogress) >> 0);
            var fixtotal = ((result.length * this.wordprogress) * this.wordprogress) >> 0;
            var chars = '';
            for (var i = 0; i < chartotal; i++) {
                if (i < fixtotal) {
                    chars += result.charAt(i);
                } else {
                    chars += this.word.charAt((Math.random() * this.word.length) >> 0);
                }
            }
            this.word = chars;
        }
        tweentext.call(this);
        setInterval(() => {
            tweentext.call(this);
        }, 5000)
  }
};
</script>