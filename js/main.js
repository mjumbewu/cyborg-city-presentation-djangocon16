class SlideshowState {
  constructor() {
    this.current = 'title-slide';
    this.upcoming = [
      'bio-urban',
      'q1-phenomena,q1-empty',
      'q1-phenomena,q1-civic-tech',
      'q1-phenomena,q1-cyborgification',
      'years-1990s',
      'timeline,first-browser',
      'timeline,google-founded',
      'timeline,apple-next',
      'years-2001-2005',
      'timeline,facebook-founded',
      'timeline,wikipedia-launched',
      'timeline,craigslist-expansion',
      'timeline,dean-campaign',
      'years-2006-2010',
      'kenya-poll-place',
      'timeline,ushahidi-launched',
      'timeline,seeclickfix-founded',
      'timeline,crowdsourcing',
      'timeline,everyblock-founded',
      'timeline,oscar-grant',
      'timeline,iphone-launched',
      'timeline,android-launched',
      'timeline,youtube-founded',
      'timeline,youtube-acquired',
      'years-2011-2015',
      'timeline,cfa-fellowship',
      'cfa-class',
      'timeline,cfa-brigade',
      'timeline,gds-formed',
      'timeline,snowden-leaks',
      'timeline,black-lives-matter',
      'years-2016-2020',
      'timeline,iphone-decryption',
      'timeline,trauma',
      'years-2021-2025',
      'timeline,tour-of-duty',
      'timeline,oauth4',
      'timeline,senda',
      'years-2026-and-beyond',
      'djangocon',
      'thanks',
    ];
    this.completed = [];
  }

  advance() {
    if (this.upcoming.length > 0) {
      if (this.current) {
        this.completed.push(this.current);
      }
      this.current = this.upcoming.shift();
    }
  }

  backup() {
    if (this.completed.length > 0) {
      if (this.current) {
        this.upcoming.unshift(this.current);
      }
      this.current = this.completed.pop();
    }
  }
};

function showSlideProgressively(hash, slide){
  var steps = slide.getElementsByClassName('step');
  var foundStep = false;

  for (let step of steps) {
    if (!foundStep) {
      step.classList.remove('hidden');
    } else {
      step.classList.add('hidden');
    }

    if (step.id === hash) {
      foundStep = true;
    }
  }
}

function scrollToEvent(hash, slide) {
  var articles = slide.getElementsByTagName('article');
  var slippy = document.getElementById('timeline-slippy');
  var selected = hash ? document.getElementById(hash) : null;
  var eventBounds, eventLeft, eventWidth;
  var slippyBounds;
  var slideBounds, slideWidth;

  for (let article of articles) {
    article.classList.remove('selected');
  }

  if (!selected) return;

  slideBounds = slide.getBoundingClientRect()
  slideWidth = slideBounds.right - slideBounds.left;

  slippyBounds = slippy.getBoundingClientRect();

  eventBounds = selected.getBoundingClientRect();
  eventLeft = eventBounds.left - slippyBounds.left;
  eventWidth = eventBounds.right - eventBounds.left;

  slippy.style.left = (-eventLeft - eventWidth / 2 + slideWidth / 2) + 'px';
  selected.classList.add('selected');
}

function goToSubslide(hash, slide) {
  if (!hash) return;

  if (slide.classList.contains('progressive')) {
    showSlideProgressively.apply(null, arguments);
  } else if (slide.classList.contains('timeline')) {
    scrollToEvent.apply(null, arguments);
  }
}

function goToSlide(hash, slides, transition, transitionTime) {
  if (!hash) return;

  console.log('jumping to slide ' + hash);

  var hashItems = hash.split(',');
  var subHash;
  var slideToShow;

  hash = hashItems[0];
  subHash = hashItems.length > 1 ? hashItems[1] : null;

  // Get the slide we're supposed to show
  for (let slide of slides) {
    if (slide.id === hash) {
      slideToShow = slide;
    }
  }

  // If that slide is already shown, just process any sub-slide action.
  if (!slideToShow.classList.contains('hidden')){
    goToSubslide(subHash, slideToShow);
    return;
  }

  // Hide all the slides and show the transition div
  for (let slide of slides) {
    slide.classList.add('hidden');
  }
  transition.classList.remove('hidden');

  // After a short period, hide the transision div and show the slide. Process
  // any sub-slide information.
  setTimeout(() => {
    transition.classList.add('hidden');
    slideToShow.classList.remove('hidden');
    goToSubslide(subHash, slideToShow);
  }, transitionTime);
}

window.onload = function() {
  var state = new SlideshowState();
  var slides = document.getElementsByClassName('slide');
  var transition = document.getElementById('white-noise');
  var initialHash = window.location.hash.slice(1)

  // Initialize based on the hash
  goToSlide(initialHash, slides, transition, 0);
  while (initialHash && state.current !== initialHash && state.upcoming.length > 0) {
    state.advance();
  }

  // Handle a hash change
  window.onhashchange = function(evt) {
    evt.preventDefault();
    if (evt.newURL === evt.oldURL) { return; }
    goToSlide(window.location.hash.slice(1), slides, transition, 150);
  }

  window.onkeyup = function(evt) {
    if (evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey) { return; }

    evt.preventDefault();
    switch (evt.code) {
      case 'ArrowUp':
      case 'ArrowRight':
        state.advance();
        break;

      case 'ArrowDown':
      case 'ArrowLeft':
        state.backup();
        break;
    }
    window.location = '#' + state.current;
  }

  window.ontouchstart = function() { window._touchStartTime = new Date(); }
  window.ontouchend = function(evt) {
    if (new Date() - window._touchStartTime < 500) {
      window.ontouchtap(evt);
    }
  }

  window.ontouchtap = function(evt) {
    state.advance();
    window.location = '#' + state.current;
  }
}
