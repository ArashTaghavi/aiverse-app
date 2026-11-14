import {
    index,
    upload,
    show,
    status,
    ask,
} from '@/actions/App/Modules/ChatWithDocument/Controllers/ChatWithDocumentController';
import type { FileChatConfig } from '../Base/Types/FileChat';
import { EventEnum } from './Enums/EventEnum';
import { Module } from './Module';

export const ChatConfig = {
    name: Module.Name,
    title: Module.Title,
    channelPrefix: Module.ChannelPrefix,
    eventId: 'document_id',
    file: {
        label: 'Word document',
        extension: '.docx',
        accept: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
    events: EventEnum,
    routes: { index, upload, show, status, ask },
} satisfies FileChatConfig;
