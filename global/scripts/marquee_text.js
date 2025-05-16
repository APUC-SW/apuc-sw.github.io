window.addEventListener('DOMContentLoaded', () => {
    const wrappers = document.querySelectorAll('.marquee-wrapper');

    wrappers.forEach(wrapper => {
        const text = wrapper.querySelector('.marquee-text');
        if (!text) return;

        const wrapperWidth = wrapper.clientWidth;
        const textWidth = text.scrollWidth;

        if (textWidth > wrapperWidth) {
            const scrollAmount = textWidth - wrapperWidth + 10;
            const scrollDuration = 3000;
            const waitBefore = 1000;
            const waitAfter = 1000;

            function scrollOnce() {
                setTimeout(() => {
                    text.style.transform = 'translateX(0)';

                    requestAnimationFrame(() => {
                        const animation = text.animate([
                            { transform: 'translateX(0)' },
                            { transform: `translateX(-${scrollAmount}px)` }
                        ], {
                            duration: scrollDuration,
                            easing: 'linear',
                            fill: 'forwards'
                        });

                        animation.onfinish = () => {
                            setTimeout(scrollOnce, waitAfter);
                        };
                    });
                }, waitBefore);
            }

            scrollOnce();
        }
    });
});
