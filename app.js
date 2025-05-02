import { createApp } from 'vue';

const app = createApp({
    data() {
        return {
            darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
            prompt: '',
            promptError: false,
            selectedStyle: 'photorealistic',
            imageCount: 1,
            isGenerating: false,
            stylePreview: null,
            generatedImages: [],
            styles: [
                { id: 'photorealistic', name: 'Photorealistic' },
                { id: 'anime', name: 'Anime Style' },
                { id: 'cyberpunk', name: 'Cyberpunk' },
                { id: 'fantasy', name: 'Fantasy Art' },
                { id: 'oil_painting', name: 'Oil Painting' },
                { id: 'watercolor', name: 'Watercolor' },
                { id: 'pixel_art', name: 'Pixel Art' },
                { id: 'futuristic', name: 'Futuristic' },
                { id: 'pop_art', name: 'Pop Art' },
                { id: 'minimalist', name: 'Minimalist' },
                { id: 'abstract', name: 'Abstract' },
                { id: 'steampunk', name: 'Steampunk' },
                { id: 'gothic', name: 'Gothic' },
                { id: 'surrealist', name: 'Surrealist' },
                { id: 'vaporwave', name: 'Vaporwave' }
            ]
        };
    },
    methods: {
        toggleTheme() {
            this.darkMode = !this.darkMode;
            document.documentElement.setAttribute('data-theme', this.darkMode ? 'dark' : 'light');
        },
        async updateStylePreview() {
            try {
                // Generate a simple preview image for the selected style
                const result = await websim.imageGen({
                    prompt: `A simple example of ${this.selectedStyle} style art`,
                    width: 300,
                    height: 300,
                });
                this.stylePreview = result.url;
            } catch (error) {
                console.error('Error generating style preview:', error);
            }
        },
        async generateImages() {
            if (!this.prompt.trim()) {
                this.promptError = true;
                return;
            }
            
            this.promptError = false;
            this.isGenerating = true;
            this.generatedImages = [];
            
            try {
                const promiseArray = [];
                for (let i = 0; i < this.imageCount; i++) {
                    promiseArray.push(
                        websim.imageGen({
                            prompt: `${this.prompt} in ${this.selectedStyle} style`,
                            width: 512,
                            height: 512,
                            seed: Math.floor(Math.random() * 1000000)
                        })
                    );
                }
                
                const results = await Promise.all(promiseArray);
                this.generatedImages = results.map(result => ({
                    url: result.url
                }));
            } catch (error) {
                console.error('Error generating images:', error);
                alert('An error occurred while generating images. Please try again.');
            } finally {
                this.isGenerating = false;
            }
        },
        async downloadImage(url, index) {
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = `generated-image-${index + 1}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            } catch (error) {
                console.error('Error downloading image:', error);
                alert('Failed to download image');
            }
        },
        async shareImage(url) {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'AI Generated Image',
                        text: 'Check out this AI-generated image!',
                        url: url
                    });
                } catch (error) {
                    console.error('Error sharing:', error);
                }
            } else {
                // Fallback: Copy to clipboard
                try {
                    await navigator.clipboard.writeText(url);
                    alert('Image URL copied to clipboard!');
                } catch (error) {
                    console.error('Error copying to clipboard:', error);
                }
            }
        }
    },
    mounted() {
        this.updateStylePreview();
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', e => {
                this.darkMode = e.matches;
                document.documentElement.setAttribute('data-theme', this.darkMode ? 'dark' : 'light');
            });
    }
});

app.mount('#app');

