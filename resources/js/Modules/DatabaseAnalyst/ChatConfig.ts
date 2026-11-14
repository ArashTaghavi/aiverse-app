import {
    index,
    upload,
    show,
    status,
    ask,
} from '@/actions/App/Modules/DatabaseAnalyst/Controllers/DatabaseAnalystController';
import type { FileChatConfig } from '../Base/Types/FileChat';
import { EventEnum } from './Enums/EventEnum';
import { Module } from './Module';

export const ChatConfig = {
    name: Module.Name,
    title: Module.Title,
    channelPrefix: Module.ChannelPrefix,
    eventId: 'database_id',
    file: {
        label: 'SQL file',
        extension: '.sql',
        accept: '.sql,text/plain,application/sql,application/x-sql,text/x-sql',
    },
    events: EventEnum,
    routes: { index, upload, show, status, ask },
} satisfies FileChatConfig;
