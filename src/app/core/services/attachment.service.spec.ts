import { TestBed } from '@angular/core/testing';
import { AttachmentService } from './attachment.service';
import { ApiClientService } from '../api/httpclient';
import { Attachment, AttachmentType } from '../../shared/interfaces/attachment';
import { Observable } from 'rxjs';

describe('AttachmentService', () => {
  let service: AttachmentService;
  let apiServiceSpy: jasmine.SpyObj<ApiClientService>;

  const mockAttachments: Attachment[] = [
    {
      content: 'base64content',
      attachmentType: AttachmentType.IDENTIFICATION,
      fileName: 'test.pdf'
    }
  ];

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiClientService', ['post']);
    apiServiceSpy = spy;

    TestBed.configureTestingModule({
      providers: [
        AttachmentService,
        { provide: ApiClientService, useValue: spy }
      ]
    });

    service = TestBed.inject(AttachmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('uploadDocument', () => {
    it('should call api.post with correct parameters', () => {
      const clientId = '123';
      const expectedUrl = `client/attachments/${clientId}`;
      
      apiServiceSpy.post.and.returnValue(new Observable<void>());

      service.uploadDocument(clientId, mockAttachments);

      expect(apiServiceSpy.post).toHaveBeenCalledWith(expectedUrl, mockAttachments);
    });

    it('should return Observable from api.post', () => {
      const clientId = '123';
      const mockResponse = new Observable<void>();
      
      apiServiceSpy.post.and.returnValue(mockResponse);

      const result = service.uploadDocument(clientId, mockAttachments);

      expect(result).toBe(mockResponse);
    });

    it('should handle empty attachments array', () => {
      const clientId = '123';
      const emptyAttachments: Attachment[] = [];
      
      apiServiceSpy.post.and.returnValue(new Observable<void>());

      service.uploadDocument(clientId, emptyAttachments);

      expect(apiServiceSpy.post).toHaveBeenCalledWith(`client/attachments/${clientId}`, emptyAttachments);
    });

    it('should handle multiple attachments', () => {
      const clientId = '123';
      const multipleAttachments: Attachment[] = [
        {
          content: 'base64content1',
          attachmentType: AttachmentType.IDENTIFICATION,
          fileName: 'test1.pdf'
        },
        {
          content: 'base64content2',
          attachmentType: AttachmentType.PORTRAIT_PHOTO,
          fileName: 'test2.pdf'
        }
      ];
      
      apiServiceSpy.post.and.returnValue(new Observable<void>());

      service.uploadDocument(clientId, multipleAttachments);

      expect(apiServiceSpy.post).toHaveBeenCalledWith(`client/attachments/${clientId}`, multipleAttachments);
    });
  });
});
