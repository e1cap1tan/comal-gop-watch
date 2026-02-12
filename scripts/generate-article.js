#!/usr/bin/env node

/* ══════════════════════════════════════════
   Comal County GOP Watch — Article Generator
   Creates standalone article pages from command-line arguments
   ══════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function parseArgs() {
    const args = process.argv.slice(2);
    const parsed = {};
    
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            const key = args[i].substring(2);
            const value = args[i + 1];
            if (value && !value.startsWith('--')) {
                parsed[key] = value;
                i++; // Skip the value in next iteration
            }
        }
    }
    
    return parsed;
}

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T12:00:00'); // Assume noon to avoid timezone issues
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function parseSources(sourcesStr) {
    if (!sourcesStr) return [];
    
    return sourcesStr.split(',').map(source => {
        const trimmed = source.trim();
        if (trimmed.includes('|')) {
            const [name, url] = trimmed.split('|');
            return { name: name.trim(), url: url.trim() };
        } else {
            return { name: trimmed };
        }
    });
}

async function generateArticleImage(slug, title, tags) {
    try {
        // Create image prompt based on article title and tags
        const tagsForPrompt = tags ? tags.split(',').map(t => t.trim()).join(', ') : '';
        const prompt = `Professional news header image for article about ${title}. ${tagsForPrompt ? `Related to: ${tagsForPrompt}. ` : ''}Bold modern journalistic photography style, high contrast, clean composition, Texas local government and politics theme`;
        
        const imagePath = path.join(__dirname, '..', 'articles', 'images', `${slug}.jpg`);
        const imageGeneratorPath = path.join(__dirname, '..', '..', 'tools', 'xai-image', 'generate.sh');
        
        // Ensure images directory exists
        const imagesDir = path.join(__dirname, '..', 'articles', 'images');
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }
        
        // Run image generation
        console.log('Generating header image...');
        execSync(`export XAI_API_KEY="$(grep -o '"xai": {"apiKey": "[^"]*"' ~/.openclaw/openclaw.json | cut -d'"' -f6)" && cd "${path.dirname(imageGeneratorPath)}" && ./generate.sh "${prompt}" grok-imagine-image "${imagePath}"`, 
                 { stdio: 'inherit', shell: '/bin/bash' });
        
        return `images/${slug}.jpg`;
    } catch (error) {
        console.warn('Image generation failed:', error.message);
        return null;
    }
}

async function generateArticle(options) {
    const { slug, title, date, body, tags, sources } = options;
    
    // Validate required fields
    if (!slug || !title || !date || !body) {
        throw new Error('Missing required fields: slug, title, date, body');
    }
    
    // Generate article image first
    const imagePath = await generateArticleImage(slug, title, tags);
    
    // Read template
    const templatePath = path.join(__dirname, '..', 'articles', 'template.html');
    if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found at ${templatePath}`);
    }
    
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Format date
    const dateFormatted = formatDate(date);
    const dateIso = date;
    
    // Parse sources and tags
    const parsedSources = parseSources(sources);
    const parsedTags = tags ? tags.split(',').map(t => t.trim()) : [];
    
    // Add hero image if generated
    const heroImageHtml = imagePath 
        ? `            <div class="article-hero-image">
                <img src="${imagePath}" alt="${title}" />
            </div>`
        : '';
    
    // Replace placeholders - starting with the simple ones
    template = template.replace(/{{TITLE}}/g, title);
    template = template.replace(/{{DATE_ISO}}/g, dateIso);
    template = template.replace(/{{DATE_FORMATTED}}/g, dateFormatted);
    template = template.replace(/{{BODY}}/g, body);
    template = template.replace(/{{HERO_IMAGE}}/g, heroImageHtml);
    
    // Handle sources section
    if (parsedSources.length > 0) {
        const sourcesHtml = parsedSources.map(source => {
            if (source.url) {
                return `                    <li><a href="${source.url}" target="_blank" rel="noopener">${source.name}</a></li>`;
            } else {
                return `                    <li>${source.name}</li>`;
            }
        }).join('\n');
        
        const sourcesSection = `            <section class="article-sources">
                <h3>Sources</h3>
                <ul>
${sourcesHtml}
                </ul>
            </section>`;
        
        template = template.replace(/{{#if SOURCES}}[\s\S]*?{{\/if}}/g, sourcesSection);
    } else {
        // Remove sources section if no sources
        template = template.replace(/\s*{{#if SOURCES}}[\s\S]*?{{\/if}}/g, '');
    }
    
    // Handle tags section  
    if (parsedTags.length > 0) {
        const tagsHtml = parsedTags.map(tag => `                <span class="tag">${tag}</span>`).join('\n');
        
        const tagsSection = `            <section class="article-tags">
${tagsHtml}
            </section>`;
        
        template = template.replace(/{{#if TAGS}}[\s\S]*?{{\/if}}/g, tagsSection);
    } else {
        // Remove tags section if no tags
        template = template.replace(/\s*{{#if TAGS}}[\s\S]*?{{\/if}}/g, '');
    }
    
    // Create output file
    const outputPath = path.join(__dirname, '..', 'articles', `${slug}.html`);
    fs.writeFileSync(outputPath, template, 'utf8');
    
    return `articles/${slug}.html`;
}

async function main() {
    try {
        const options = parseArgs();
        
        if (Object.keys(options).length === 0) {
            console.log(`Usage: node generate-article.js \\
  --slug "article-slug" \\
  --title "Article Title" \\
  --date "YYYY-MM-DD" \\
  --body "<p>Article content...</p>" \\
  --tags "tag1,tag2,tag3" \\
  --sources "Source Name|url,Source Name 2"`);
            process.exit(1);
        }
        
        const articlePath = await generateArticle(options);
        console.log(articlePath);
        
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { generateArticle };