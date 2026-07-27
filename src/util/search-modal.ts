import { ActionRowBuilder, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js';
import { SearchFilters } from '../types/search';

export class SearchModal {
    public static readonly MODAL_ID = 'search:modal';
    public static readonly BUTTON_PREFIX = 'search:refine';

    private static readonly MAX_CUSTOM_ID_LENGTH = 100;

    public static build(filters: SearchFilters): ModalBuilder {
        const modal = new ModalBuilder().setCustomId(this.MODAL_ID).setTitle('Spots zoeken');

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(this.input('merk', 'Merk', filters.brand)),
            new ActionRowBuilder<TextInputBuilder>().addComponents(this.input('kleur', 'Kleur', filters.color)),
            new ActionRowBuilder<TextInputBuilder>().addComponents(this.input('brandstof', 'Brandstof', filters.fuel))
        );

        return modal;
    }

    public static buttonId(filters: SearchFilters): string {
        const encoded = [
            this.BUTTON_PREFIX,
            encodeURIComponent(filters.brand ?? ''),
            encodeURIComponent(filters.color ?? ''),
            encodeURIComponent(filters.fuel ?? ''),
        ].join(':');

        if (encoded.length > this.MAX_CUSTOM_ID_LENGTH) {
            return this.BUTTON_PREFIX;
        }

        return encoded;
    }

    public static parseButtonId(customId: string): SearchFilters {
        const parts = customId.split(':');

        return {
            brand: this.decodePart(parts[2]),
            color: this.decodePart(parts[3]),
            fuel: this.decodePart(parts[4]),
        };
    }

    public static fromSubmit(interaction: ModalSubmitInteraction): SearchFilters {
        return {
            brand: this.normalize(interaction.fields.getTextInputValue('merk')),
            color: this.normalize(interaction.fields.getTextInputValue('kleur')),
            fuel: this.normalize(interaction.fields.getTextInputValue('brandstof')),
        };
    }

    private static input(id: string, label: string, value?: string): TextInputBuilder {
        const input = new TextInputBuilder()
            .setCustomId(id)
            .setLabel(label)
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setMaxLength(50);

        if (value) {
            input.setValue(value);
        }

        return input;
    }

    private static decodePart(part: string | undefined): string | undefined {
        if (!part) {
            return undefined;
        }

        return decodeURIComponent(part);
    }

    private static normalize(value: string): string | undefined {
        const trimmed = value.trim();
        return trimmed ? trimmed : undefined;
    }
}
