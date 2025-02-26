export class TagConfigurationDialog extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: 'tag-configuration',
            title: 'Tag Configuration',
            template: 'modules/sorted-status-effects/templates/tag-config.html',
            width: 500,
            height: 'auto',
            closeOnSubmit: true
        });
    }

    getData() {
        const tags = game.settings.get('sorted-status-effects', 'statusEffectsTags') || [];
        const tagIcons = game.settings.get('sorted-status-effects', 'tagIcons') || {};

        if (tags.length === 0 || !tags[0]) {
            return {
                tags: [{ name: '', icon: '' }]
            };
        }
        
        return {
            tags: tags.map(tag => ({
                name: tag,
                icon: tagIcons[tag] || 'icons/svg/d20.svg'
            }))
        };
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Add click handler for delete buttons
        html.find('.delete-tag').click(this._onDeleteTag.bind(this));

        // Add input handler for icon path changes
        html.find('input[name^="tagIcon"]').on('change', this._onIconPathChange.bind(this));

        // Initialize FilePicker with a single delegated handler
        html.find('#tag-list').on('click', 'button.file-picker', async (event) => {
            const fp = await FilePicker.browse('data', '', {type: 'imagevideo'});
            if (fp.path) {
                const input = $(event.currentTarget).siblings('input[name^="tagIcon"]');
                input.val(fp.path).trigger('change');
            }
        });
    }

    async _onDeleteTag(event) {
        event.preventDefault();
        const index = event.currentTarget.dataset.index;
        const tags = game.settings.get('sorted-status-effects', 'statusEffectsTags') || [];
        const tagIcons = game.settings.get('sorted-status-effects', 'tagIcons') || {};
        
        // Remove the tag and its icon
        const tagToRemove = tags[index];
        tags.splice(index, 1);
        delete tagIcons[tagToRemove];

        // Save the updated settings
        await game.settings.set('sorted-status-effects', 'statusEffectsTags', tags);
        await game.settings.set('sorted-status-effects', 'tagIcons', tagIcons);

        // Re-render the form
        this.render();
    }

    _onIconPathChange(event) {
        const input = event.currentTarget;
        const preview = $(input).closest('.tag-entry').find('.tag-preview');
        preview.attr('src', input.value || 'icons/svg/d20.svg');
    }

    async _updateObject(event, formData) {
        const tags = [];
        const tagIcons = {};
        
        // Convert form data to tags and icons
        Object.entries(formData).forEach(([key, value]) => {
            if (key.startsWith('tagName')) {
                const index = key.replace('tagName', '');
                const iconKey = `tagIcon${index}`;
                const tagName = value.trim();
                const iconPath = formData[iconKey]?.trim();
                
                if (tagName) {
                    tags.push(tagName);
                    if (iconPath) {
                        tagIcons[tagName] = iconPath;
                    }
                }
            }
        });

        await game.settings.set('sorted-status-effects', 'statusEffectsTags', tags);
        await game.settings.set('sorted-status-effects', 'tagIcons', tagIcons);
    }
}