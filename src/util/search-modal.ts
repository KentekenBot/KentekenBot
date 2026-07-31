import { ActionRowBuilder, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js';
import { SearchFilters } from '../types/search.types';
import { Str } from './str';

export class SearchModal {
    public static readonly MODAL_ID = 'search:modal';
    public static readonly BUTTON_PREFIX = 'search:refine';

    // Also the cap on the slash command options, so a filter typed there can always
    // be prefilled back into this modal.
    public static readonly MAX_LENGTH = 50;

    private static readonly MAX_CUSTOM_ID_LENGTH = 100;

    public static build(filters: SearchFilters): ModalBuilder {
        const modal = new ModalBuilder().setCustomId(this.modalId(filters)).setTitle('Spots zoeken');

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
            filters.spotterId ?? '',
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
            spotterId: parts[5] ? parts[5] : undefined,
        };
    }

    public static fromSubmit(interaction: ModalSubmitInteraction): SearchFilters {
        return {
            brand: this.normalize(interaction.fields.getTextInputValue('merk')),
            color: this.normalize(interaction.fields.getTextInputValue('kleur')),
            fuel: this.normalize(interaction.fields.getTextInputValue('brandstof')),
            spotterId: this.parseModalId(interaction.customId),
        };
    }

    private static modalId(filters: SearchFilters): string {
        if (!filters.spotterId) {
            return this.MODAL_ID;
        }

        return `${this.MODAL_ID}:${filters.spotterId}`;
    }

    private static parseModalId(customId: string): string | undefined {
        const spotterId = customId.slice(`${this.MODAL_ID}:`.length);

        return customId.startsWith(`${this.MODAL_ID}:`) && spotterId ? spotterId : undefined;
    }

    private static input(id: string, label: string, value?: string): TextInputBuilder {
        const input = new TextInputBuilder()
            .setCustomId(id)
            .setLabel(label)
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setMaxLength(this.MAX_LENGTH);

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
        const trimmed = Str.withoutLikeWildcards(value).trim();
        return trimmed ? trimmed : undefined;
    }
}
