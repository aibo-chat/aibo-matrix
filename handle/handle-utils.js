let coins = "bitcoin|btc\nethereum|eth\ntether(\\s+)usdt|usdt\nbnb|bnb\nsolana|sol\nxrp|xrp\nusdc|usdc\ncardano|ada\n" + "avalanche|avax\ndogecoin|doge\ntron|trx\nchainlink|link\npolkadot|dot\ntoncoin|ton\npolygon|matic\nshiba(\\s+)inu|shib\n" + "dai|dai\nlitecoin|ltc\ninternet(\\s+)computer|icp\nbitcoin(\\s+)cash|bch\nuniswap|uni\ncosmos|atom\nunus(\\s+)sed(\\s+)leo|leo\n" + "ethereum(\\s+)classic|etc\nstellar|xlm\nokb|okb\noptimism|op\ninjective|inj\nnear(\\s+)protocol|near\nmonero|xmr\naptos|apt\n" + "celestia|tia\nfilecoin|fil\nfirst(\\s+)digital(\\s+)usd|fdusd\nlido(\\s+)dao|ldo\nhedera|hbar\nimmutable|imx\nkaspa|kas\n" + "arbitrum|arb\nmantle|mnt\ncronos|cro\nstacks|stx\nvechain|vet\ntrueusd|tusd\nmaker|mkr\nsei|sei\nrender|rndr\n" + "the(\\s+)graph|grt\naave|aave\nordi|ordi\nthorchain|rune\nbitcoin(\\s+)sv|bsv\nmultiversx|egld\nalgorand|algo\nquant|qnt\n" + "sui|sui\nmina|mina\nflow|flow\nsats|1000sats\nhelium|hnt\naxie(\\s+)infinity|axs\nfantom|ftm\nthe(\\s+)sandbox|sand\n" + "theta(\\s+)network|theta\nsynthetix|snx\ntezos|xtz\nastar|astr\nkucoin(\\s+)token|kcs\nbittorrent (new)|btt\nbeam|beam\n" + "wemix|wemix\ndecentraland|mana\ndydx (ethdydx)|ethdydx\nchiliz|chz\nftx(\\s+)token|ftt\nbitget(\\s+)token|bgb\nneo|neo\n" + "eos|eos\nosmosis|osmo\nblur|blur\nkava|kava\nwoo|woo\nusdd|usdd\nflare|flr\nbonk|bonk\niota|iota\nklaytn|klay\n" + "frax(\\s+)share|fxs\npancakeswap|cake\nconflux|cfx\noasis(\\s+)network|rose\ngala|gala\nxdc(\\s+)network|xdc\narweave|ar\n" + "akash(\\s+)network|akt\nterra(\\s+)classic|lunc\necash|xec\nsiacoin|sc\nrocket(\\s+)pool|rpl\nronin|ron\nmanta(\\s+)network|manta\n" + "pyth(\\s+)network|pyth\nfetch.ai|fet\nradix|xrd\naelf|elf\ndash|dash\nssv.network|ssv\napi3|api3\njust|jst\nxai|xai\n" + "wrapped(\\s+)bitcoin|wbtc\nmyro|myro\niexec(\\s+)rlc|rlc\nbig(\\s+)time|bigtime\nradworks|rad\nsatoshivm|savm\nondo|ondo\n" + "saros|saros\nshadow(\\s+)token|shdw\npepe|pepe\nhooked(\\s+)protocol|hook\narkham|arkm\njasmycoin|jasmy\nportal (iou)|portal\n" + "dogecoin|doge\nshiba(\\s+)inu|shib\ndevai|0xdev\ndogwifhat|wif\ncoti|coti\nbtc|btc\neth|eth\nusdt|usdt\nbnb|bnb\nsol|sol\n" + "xrp|xrp\nusdc|usdc\nada|ada\navax|avax\ndoge|doge\ntrx|trx\nlink|link\ndot|dot\nton|ton\nmatic|matic\nshib|shib\n" + "dai|dai\nltc|ltc\nicp|icp\nbch|bch\nuni|uni\natom|atom\nleo|leo\netc|etc\nxlm|xlm\nokb|okb\nop|op\ninj|inj\nnear|near\n" + "xmr|xmr\napt|apt\ntia|tia\nfil|fil\nfdusd|fdusd\nldo|ldo\nhbar|hbar\nimx|imx\nkas|kas\narb|arb\nmnt|mnt\ncro|cro\n" + "stx|stx\nvet|vet\ntusd|tusd\nmkr|mkr\nsei|sei\nrndr|rndr\ngrt|grt\naave|aave\nordi|ordi\nrune|rune\nbsv|bsv\n" + "egld|egld\nalgo|algo\nqnt|qnt\nsui|sui\nmina|mina\nflow|flow\n1000sats|1000sats\nhnt|hnt\naxs|axs\nftm|ftm\n" + "sand|sand\ntheta|theta\nsnx|snx\nxtz|xtz\nastr|astr\nkcs|kcs\nbtt|btt\nbeam|beam\nwemix|wemix\nmana|mana\n" + "ethdydx|ethdydx\nchz|chz\nftt|ftt\nbgb|bgb\nneo|neo\neos|eos\nosmo|osmo\nblur|blur\nkava|kava\nwoo|woo\nusdd|usdd\n" + "flr|flr\nbonk|bonk\niota|iota\nklay|klay\nfxs|fxs\ncake|cake\ncfx|cfx\nrose|rose\ngala|gala\nxdc|xdc\nar|ar\n" + "akt|akt\nlunc|lunc\nxec|xec\nsc|sc\nrpl|rpl\nron|ron\nmanta|manta\npyth|pyth\nfet|fet\nxrd|xrd\nelf|elf\ndash|dash\n" + "ssv|ssv\napi3|api3\njst|jst\nxai|xai\nwbtc|wbtc\nmyro|myro\nrlc|rlc\nbigtime|bigtime\nrad|rad\nsavm|savm\nondo|ondo\n" + "saros|saros\nshdw|shdw\npepe|pepe\nhook|hook\narkm|arkm\njasmy|jasmy\nportal|portal\ndoge|doge\nshib|shib\n" + "0xdev|0xdev\nwif|wif\ncoti|coti"
let coin_map = {};
for (let item of coins.split("\n")) {
  let a = item.split("|");
  coin_map[a[0]] = a[1];
}


module.exports = {
  matchTemplateType: function (bot, msg) {
    if (!msg || !bot.question_template) return;
    for (let kind of bot.question_template.kinds) {
      for (let question of kind.questions) {
        let {name, question: que, type} = question;
        //替换通配符
        que = que.replace(/\${.*}/g, " ");
        //替换介词
        // que = que.replace(/((about)|(of)|(in)|(on)|(with)|(is)|(are)|(the)|(please)|(me))\W/gi, " ");
        //替换非字母
        que = que.replace(/\W+/g, ".*")
        let m = msg.match(new RegExp(que));
        if (m) return type;
      }
    }
  },

  extractTokeSymbol: function (str) {
    str = str.toLowerCase();
    let tokens = []
    for (let key in coin_map) {
      let value = coin_map[key];
      if (key.length < 5) {
        if (str.match(new RegExp(" " + key + "\\W")) ||
          str.match(new RegExp("^" + key + "\\W")) ||
          str.match(new RegExp(" " + key + "$"))) {
          tokens.push(value);
        }
      } else {
        if (str.match(key)) tokens.push(value);
      }
    }
    return Array.from(new Set(tokens));
  },

  extractTimestamp: function (str) {
    str = str.toLowerCase();
    // let m;
    // if (m = str.match(/(\d+)m/)) {
    //   console.log(m[1]);
    //   return Date.now() - m[1] * 60 * 1000;
    // }
    // if (m = str.match(/(\d+)h/)) {
    //   console.log(m[1]);
    //   return Date.now() - m[1] * 60 * 60 * 1000;
    // }
    // if (m = str.match(/(\d+)d/)) {
    //   console.log(m[1]);
    //   return Date.now() - m[1] * 24 * 60 * 60 * 1000;
    // }
    // if (m = str.match(/(\d+)m/)) {
    //   console.log(m[1]);
    //   return Date.now() - m[1] * 30 * 24 * 60 * 60 * 1000;
    // }
  }

}
