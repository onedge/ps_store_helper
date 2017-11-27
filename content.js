function increase_height(target,incresement){
	let height = target.offsetHeight;
	if(height){
		let new_height = height + incresement;
		target.style.height = new_height +'px';
	}
}

function insert_meta_score(node,score){
	const insert_span = document.createElement('span');
	if(score==='tbd'){
		insert_span.className='metascore_w tbd';
	}
	else if(score >= 75){
		insert_span.className='metascore_w positive';
	}
	else if(score >= 50){
		insert_span.className='metascore_w mixed';
	}
	else 
		insert_span.className='metascore_w negtive';
	insert_span.innerHTML= score;
	node.appendChild(insert_span);
}

function insert_user_score(node,score){
	const insert_span = document.createElement('span');
	if(score==='tbd'){
		insert_span.className='metascore_w user tbd';
	}
	else if(score >= 7.5){
		insert_span.className='metascore_w user positive';
	}
	else if(score >= 5){
		insert_span.className='metascore_w user mixed';
	}
	else 
		insert_span.className='metascore_w user negtive';
	insert_span.innerHTML= score;
	node.appendChild(insert_span);
}

function insert_detail_page_meta_score(node,score,count,url){
	const insert_span = document.createElement('span');
	const insert_div = document.createElement('div');
	if(score==='tbd'){
		insert_span.className='metascore_w tbd large';
	}
	else if(score >= 75){
		insert_span.className='metascore_w positive large';
	}
	else if(score >= 50){
		insert_span.className='metascore_w mixed large';
	}
	else 
		insert_span.className='metascore_w negtive large';
	insert_div.className ='detail_metascore_text small';
	insert_span.innerHTML= score;
	insert_div.innerHTML = `<a href="${url}" target="_blank"><div class="detail_metascore_title">MetaScore</div><div>${count} critics</div></a>`
	node.appendChild(insert_span);
	node.appendChild(insert_div);
}

function insert_detail_page_user_score(node,score,count,url){
	const insert_span = document.createElement('span');
	const insert_div = document.createElement('div');
	if(score==='tbd'){
		insert_span.className='metascore_w user tbd large';
	}
	else if(score >= 7.5){
		insert_span.className='metascore_w user positive large';
	}
	else if(score >= 5){
		insert_span.className='metascore_w user mixed large';
	}
	else 
		insert_span.className='metascore_w user negtive large';
	insert_div.className ='detail_metascore_text small';
	insert_span.innerHTML = score;
	insert_div.innerHTML = `<a href="${url}" target="_blank"><div class="detail_metascore_title">MetaCritic user score</div><div>${count} ratings</div></a>`;
	node.appendChild(insert_span);
	node.appendChild(insert_div);
}

function insert_detail_page_discount(node,low_price,low_plus_price,url){
	const title = document.createElement('p');
	const price = document.createElement('p');
	const divider = document.createElement('hr');
	title.innerHTML=`Lowest Price:`;
	price.innerHTML=`<a href="${url}" target="_blank"><span> ${low_price}  </span>/<span>  ${low_plus_price}</span>(PS+)</a>`;
	divider.className='sku-info__divider';
	node.appendChild(title);
	node.appendChild(price);
	node.appendChild(divider);
}

async function inject_game_list(){
	let nodelist = [...document.querySelectorAll('.__desktop-presentation__grid-cell__base__0ba9f')];
	let res = nodelist.map(async (node)=>{
		if(!node.querySelector('.metascore_container')){
			const infoplane = node.querySelector('.grid-cell__body');
			const out_box = node.querySelector('.grid-cell');
			const insert_div = document.createElement('div');
			const infoplane_bot = infoplane.querySelector('.grid-cell__bottom');
			const infoplane_parent = infoplane_bot.parentNode;
			const psn_link = infoplane.querySelector('a');
			const psn_id = psn_link.getAttribute("href").match('([^\/]+)$')[1];
			insert_div.className='metascore_container';
			infoplane_parent.insertBefore(insert_div,infoplane_bot);
			increase_height(node,insert_div.offsetHeight);
			increase_height(infoplane,insert_div.offsetHeight);
			increase_height(out_box,insert_div.offsetHeight);
			document.querySelectorAll('.__desktop-presentation__grid-cell__base__0ba9f')
			let response = await get_metacritic_score(window.location.host,locale,psn_id);
			if(response.state ==='connect error'){
				response = await get_metacritic_score(window.location.host,locale,psn_id,true);
			}	
			if(response.state ==='success'){
				insert_meta_score(insert_div,response.meta_score);
				const insert_span = document.createElement('span');
				insert_span.innerHTML= '|';
				insert_div.appendChild(insert_span);
				insert_user_score(insert_div,response.user_score);	
			}
		}
	})
}

async function inject_detail_page(){
	const sku_info = document.querySelector('div.sku-info');
	const meta_div = document.querySelector('#detail-meta-score');
	const user_div = document.querySelector('#detail-user-score');

	if(sku_info && !meta_div && !user_div){
		const insert_div = document.createElement('div');
		const insert_user_div = document.createElement('div');
		const psn_id = document.URL.match('([^\/]+)$')[1];		
		insert_div.id = 'detail-meta-score';
		insert_user_div.id = 'detail-user-score';
		sku_info.parentNode.insertBefore(insert_div,sku_info.nextSibling);
		sku_info.parentNode.insertBefore(insert_user_div,insert_div.nextSibling);		
		let response = await get_metacritic_score(window.location.host,locale,psn_id);
		if(response.state ==='connect error'){
			response = await get_metacritic_score(window.location.host,locale,psn_id,true);
		}	
		if(response.state ==='success'){
			const url = `http://www.metacritic.com/game/${response.platform}/${response.name}`;
			insert_div.className='detail_metascore_container';
			insert_detail_page_meta_score(insert_div,response.meta_score,response.meta_count,url);				
			if(response.user_score!=='tbd'){
				insert_user_div.className='detail_metascore_container';				
				insert_detail_page_user_score(insert_user_div,response.user_score,response.user_count,url);	
			}
		}

	}
}

async function inject_discount_info_detail_page(){
	const sku_info = document.querySelector('div.sku-info');
	const discount_div = document.querySelector('#detail-discount');
	if(sku_info && !discount_div){
		const insert_low_price = document.createElement('div');
		const playable = sku_info.querySelector('.playable-on');
		const psn_id = document.URL.match('([^\/]+)$')[1];
		sku_info.insertBefore(insert_low_price,playable);
		insert_low_price.id='detail-discount';
		let response = await get_lowest_price(window.location.host,locale,psn_id);
		if(response.state ==='success'){
			insert_low_price.className = 'discount_container';
			insert_detail_page_discount(insert_low_price,response.low_price,response.low_plus_price,response.url);
		}	
	}
}

function clear_inject(){
	const meta_div = document.querySelector('#detail-meta-score');
	const user_div = document.querySelector('#detail-user-score');
	meta_div && meta_div.parentNode.removeChild(meta_div);
	user_div && user_div.parentNode.removeChild(user_div);
}

let last_inject_url;
const locale = document.URL.split('/')[3].match('([^-]+)$')[1];

const observer = new MutationObserver( mutations=> {
	inject_detail_page();
	inject_discount_info_detail_page();
	inject_game_list();
});

chrome.runtime.onMessage.addListener((request, sender, callback) =>{
	if (request.action === 'inject_metacritic'){
		const target = document.querySelector('.application-container');
		const config = { attributes: true, childList: true, characterData: true ,subtree: true};
		observer.observe(target, config);
		if(document.URL !== last_inject_url){
			clear_inject();
			last_inject_url = document.URL;
		}
	}
	else if(request.action ==='disable_inject'){
		observer.disconnect();
		clear_inject();
	}
})