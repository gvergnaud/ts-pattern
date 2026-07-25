/**
 * Shared input types for the compile-time benchmarks.
 *
 * `LargeUnion` stresses matches on large unions of string literals
 * (the same shape as a large string enum).
 *
 * `Entity` stresses matches on a wide discriminated union of object
 * types, including an intersection with a nested boolean discriminant
 * (`document`) and a nested discriminated union (`config`), which is
 * a common shape for types inferred from validation libraries.
 */

export type LargeUnion =
  | 'case-0'
  | 'case-1'
  | 'case-2'
  | 'case-3'
  | 'case-4'
  | 'case-5'
  | 'case-6'
  | 'case-7'
  | 'case-8'
  | 'case-9'
  | 'case-10'
  | 'case-11'
  | 'case-12'
  | 'case-13'
  | 'case-14'
  | 'case-15'
  | 'case-16'
  | 'case-17'
  | 'case-18'
  | 'case-19'
  | 'case-20'
  | 'case-21'
  | 'case-22'
  | 'case-23'
  | 'case-24'
  | 'case-25'
  | 'case-26'
  | 'case-27'
  | 'case-28'
  | 'case-29'
  | 'case-30'
  | 'case-31'
  | 'case-32'
  | 'case-33'
  | 'case-34'
  | 'case-35'
  | 'case-36'
  | 'case-37'
  | 'case-38'
  | 'case-39'
  | 'case-40'
  | 'case-41'
  | 'case-42'
  | 'case-43'
  | 'case-44'
  | 'case-45'
  | 'case-46'
  | 'case-47'
  | 'case-48'
  | 'case-49'
  | 'case-50'
  | 'case-51'
  | 'case-52'
  | 'case-53'
  | 'case-54'
  | 'case-55'
  | 'case-56'
  | 'case-57'
  | 'case-58'
  | 'case-59'
  | 'case-60'
  | 'case-61'
  | 'case-62'
  | 'case-63'
  | 'case-64'
  | 'case-65'
  | 'case-66'
  | 'case-67'
  | 'case-68'
  | 'case-69'
  | 'case-70'
  | 'case-71'
  | 'case-72'
  | 'case-73'
  | 'case-74'
  | 'case-75'
  | 'case-76'
  | 'case-77'
  | 'case-78'
  | 'case-79'
  | 'case-80'
  | 'case-81'
  | 'case-82'
  | 'case-83'
  | 'case-84'
  | 'case-85'
  | 'case-86'
  | 'case-87'
  | 'case-88'
  | 'case-89'
  | 'case-90'
  | 'case-91'
  | 'case-92'
  | 'case-93'
  | 'case-94'
  | 'case-95'
  | 'case-96'
  | 'case-97'
  | 'case-98'
  | 'case-99'
  | 'case-100'
  | 'case-101'
  | 'case-102'
  | 'case-103'
  | 'case-104'
  | 'case-105'
  | 'case-106'
  | 'case-107'
  | 'case-108'
  | 'case-109'
  | 'case-110'
  | 'case-111'
  | 'case-112'
  | 'case-113'
  | 'case-114'
  | 'case-115'
  | 'case-116'
  | 'case-117'
  | 'case-118'
  | 'case-119'
  | 'case-120'
  | 'case-121'
  | 'case-122'
  | 'case-123'
  | 'case-124'
  | 'case-125'
  | 'case-126'
  | 'case-127'
  | 'case-128'
  | 'case-129'
  | 'case-130'
  | 'case-131'
  | 'case-132'
  | 'case-133'
  | 'case-134'
  | 'case-135'
  | 'case-136'
  | 'case-137'
  | 'case-138'
  | 'case-139'
  | 'case-140'
  | 'case-141'
  | 'case-142'
  | 'case-143'
  | 'case-144'
  | 'case-145'
  | 'case-146'
  | 'case-147'
  | 'case-148'
  | 'case-149'
  | 'case-150'
  | 'case-151'
  | 'case-152'
  | 'case-153'
  | 'case-154'
  | 'case-155'
  | 'case-156'
  | 'case-157'
  | 'case-158'
  | 'case-159'
  | 'case-160'
  | 'case-161'
  | 'case-162'
  | 'case-163'
  | 'case-164'
  | 'case-165'
  | 'case-166'
  | 'case-167'
  | 'case-168'
  | 'case-169'
  | 'case-170'
  | 'case-171'
  | 'case-172'
  | 'case-173'
  | 'case-174'
  | 'case-175'
  | 'case-176'
  | 'case-177'
  | 'case-178'
  | 'case-179'
  | 'case-180'
  | 'case-181'
  | 'case-182'
  | 'case-183'
  | 'case-184'
  | 'case-185'
  | 'case-186'
  | 'case-187'
  | 'case-188'
  | 'case-189'
  | 'case-190'
  | 'case-191'
  | 'case-192'
  | 'case-193'
  | 'case-194'
  | 'case-195'
  | 'case-196'
  | 'case-197'
  | 'case-198'
  | 'case-199';

type Priority = 'low' | 'medium' | 'high';

type Base = {
  id?: string;
  priority: Priority;
  name: string;
  url: string;
  active: boolean;
  archived?: boolean;
};

type Comment = { id: string; body: string; index: number; score: number };

export type Entity =
  | (Base & { kind: 'document'; documentId: string; format: string | null } & (
        | { inlined: true; body: string }
        | { inlined: false; comments: Comment[] }
      ))
  | (Base & {
      kind: 'user';
      userId: string;
      posts: Comment[];
      comments: Comment[];
    })
  | (Base & { kind: 'member'; memberId: string; body: string })
  | (Base & {
      kind: 'group';
      groupId: string;
      posts: Comment[];
      comments: Comment[];
    })
  | (Base & { kind: 'article'; articleId: string; body: string })
  | (Base & { kind: 'website'; body: string })
  | (Base & { kind: 'image'; imageId: string; body: string })
  | (Base & { kind: 'video'; videoId: string; body: string })
  | (Base & { kind: 'audio'; audioId: string; body: string })
  | (Base & { kind: 'link'; linkId: string; body: string })
  | (Base & { kind: 'note'; noteId: string; body: string })
  | (Base & { kind: 'message'; messageId: string; body: string })
  | (Base & { kind: 'folder'; folderId: string; header: string })
  | (Base & {
      kind: 'reaction';
      reactionId: string;
      reactionName: string;
      body: string;
    })
  | (Base & {
      kind: 'bookmark';
      bookmarkId: string;
      bookmarkIndex?: string | null;
      body: string;
    })
  | (Base & { kind: 'config' } & (
        | {
            area: 'appearance';
            values?: {
              id: string;
              name: string;
              color?: string;
              order: number;
            }[];
          }
        | {
            area: 'notifications' | 'custom';
            values?: Record<string, unknown>[];
          }
      ))
  | (Base & { kind: 'task'; taskId: string; body: string })
  | (Base & { kind: 'label'; labelId: string; body: string })
  | (Base & {
      kind: 'draft';
      draftId: string;
      draftName: string;
      body: string;
      mimeType?: string;
    })
  | (Base & { kind: 'thread'; threadId: string; body: string });
