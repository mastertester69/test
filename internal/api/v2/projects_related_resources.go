package api

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/hashicorp-forge/hermes/internal/server"
	"github.com/hashicorp-forge/hermes/pkg/document"
	"github.com/hashicorp-forge/hermes/pkg/models"
	"gorm.io/gorm"
)

type ProjectRelatedResourcesGetResponse struct {
	ExternalLinks   []ProjectRelatedResourcesGetResponseExternalLink   `json:"externalLinks,omitempty"`
	HermesDocuments []ProjectRelatedResourcesGetResponseHermesDocument `json:"hermesDocuments,omitempty"`
}

type ProjectRelatedResourcesGetResponseExternalLink struct {
	Name      string `json:"name"`
	URL       string `json:"url"`
	SortOrder int    `json:"sortOrder"`
}

type ProjectRelatedResourcesGetResponseHermesDocument struct {
	GoogleFileID   string `json:"googleFileID"`
	Title          string `json:"title"`
	DocumentType   string `json:"documentType"`
	DocumentNumber string `json:"documentNumber"`
	SortOrder      int    `json:"sortOrder"`
}

type ProjectRelatedResourcesPutRequest struct {
	ExternalLinks   []ProjectRelatedResourcesPutRequestExternalLink   `json:"externalLinks,omitempty"`
	HermesDocuments []ProjectRelatedResourcesPutRequestHermesDocument `json:"hermesDocuments,omitempty"`
}

type ProjectRelatedResourcesPutRequestExternalLink struct {
	Name      string `json:"name"`
	URL       string `json:"url"`
	SortOrder int    `json:"sortOrder"`
}

type ProjectRelatedResourcesPutRequestHermesDocument struct {
	GoogleFileID string `json:"googleFileID"`
	SortOrder    int    `json:"sortOrder"`
}

func projectsResourceRelatedResourcesHandler(
	srv server.Server,
	w http.ResponseWriter,
	r *http.Request,
	projectID uint,
) {
	logArgs := []any{
		"path", r.URL.Path,
		"project_id", projectID,
	}

	switch r.Method {
	case "GET":
		logArgs = append(logArgs, "method", r.Method)

		// Get project.
		proj := models.Project{}
		if err := proj.Get(srv.DB, projectID); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				srv.Logger.Warn("project not found", logArgs...)
				http.Error(w, "Project not found", http.StatusNotFound)
				return
			} else {
				srv.Logger.Error("error getting project from database",
					append([]interface{}{
						"error", err,
					}, logArgs...)...)
				http.Error(
					w, "Error processing requst", http.StatusInternalServerError)
				return
			}
		}

		// Get typed related resources.
		elrrs, hdrrs, err := proj.GetRelatedResources(srv.DB)
		if err != nil {
			srv.Logger.Error("error getting related resources",
				append([]interface{}{
					"error", err,
				}, logArgs...)...)
			http.Error(
				w, "Error processing request", http.StatusInternalServerError)
			return
		}

		// Build response.
		resp := ProjectRelatedResourcesGetResponse{
			ExternalLinks:   []ProjectRelatedResourcesGetResponseExternalLink{},
			HermesDocuments: []ProjectRelatedResourcesGetResponseHermesDocument{},
		}
		// Add external link related resources.
		for _, elrr := range elrrs {
			if err := elrr.Get(srv.DB); err != nil {
				srv.Logger.Error(
					"error getting external link related resource from database",
					append([]interface{}{
						"error", err,
					}, logArgs...)...)
				http.Error(
					w, "Error processing request", http.StatusInternalServerError)
				return
			}

			resp.ExternalLinks = append(resp.ExternalLinks,
				ProjectRelatedResourcesGetResponseExternalLink{
					Name:      elrr.Name,
					URL:       elrr.URL,
					SortOrder: elrr.RelatedResource.SortOrder,
				})
		}
		// Add Hermes document related resources.
		for _, hdrr := range hdrrs {
			logArgs = append(logArgs, "document_id", hdrr.Document.GoogleFileID)

			// Get document from database.
			model := models.Document{
				GoogleFileID: hdrr.Document.GoogleFileID,
			}
			if err := model.Get(srv.DB); err != nil {
				srv.Logger.Error("error getting document from database",
					append([]interface{}{
						"error", err,
					}, logArgs...)...)
				http.Error(
					w, "Error processing requst", http.StatusInternalServerError)
				return
			}

			// Get reviews for the document.
			var reviews models.DocumentReviews
			if err := reviews.Find(srv.DB, models.DocumentReview{
				Document: models.Document{
					GoogleFileID: hdrr.Document.GoogleFileID,
				},
			}); err != nil {
				srv.Logger.Error("error getting reviews for document",
					append([]interface{}{
						"error", err,
					}, logArgs...)...)
				http.Error(
					w, "Error processing request", http.StatusInternalServerError)
				return
			}

			// Convert database model to a document.
			doc, err := document.NewFromDatabaseModel(
				model, reviews)
			if err != nil {
				srv.Logger.Error("error converting database model to document type",
					append([]interface{}{
						"error", err,
					}, logArgs...)...)
				http.Error(
					w, "Error processing requst", http.StatusInternalServerError)
				return
			}

			resp.HermesDocuments = append(
				resp.HermesDocuments,
				ProjectRelatedResourcesGetResponseHermesDocument{
					GoogleFileID:   hdrr.Document.GoogleFileID,
					Title:          doc.Title,
					DocumentType:   doc.DocType,
					DocumentNumber: doc.DocNumber,
					SortOrder:      hdrr.RelatedResource.SortOrder,
				})
		}

		// Write response.
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		enc := json.NewEncoder(w)
		err = enc.Encode(resp)
		if err != nil {
			srv.Logger.Error("error encoding response",
				append([]interface{}{
					"error", err,
				}, logArgs...)...)
			http.Error(
				w, "Error processing requst", http.StatusInternalServerError)
			return
		}

	case "POST":
		fallthrough
	case "PUT":
		logArgs = append(logArgs, "method", r.Method)

		// Decode request.
		var req ProjectRelatedResourcesPutRequest
		if err := decodeRequest(r, &req); err != nil {
			srv.Logger.Error("error decoding request",
				append([]interface{}{
					"error", err,
				}, logArgs...)...)
			http.Error(
				w, "Bad request", http.StatusBadRequest)
			return
		}

		// Get project.
		proj := models.Project{}
		if err := proj.Get(srv.DB, projectID); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				srv.Logger.Warn("project not found", logArgs...)
				http.Error(w, "Project not found", http.StatusNotFound)
				return
			} else {
				srv.Logger.Error("error getting project from database",
					append([]interface{}{
						"error", err,
					}, logArgs...)...)
				http.Error(
					w, "Error processing request", http.StatusInternalServerError)
				return
			}
		}

		// Build external link related resources for database model.
		elrrs := []models.ProjectRelatedResourceExternalLink{}
		for _, elrr := range req.ExternalLinks {
			elrrs = append(elrrs, models.ProjectRelatedResourceExternalLink{
				RelatedResource: models.ProjectRelatedResource{
					ProjectID: uint(projectID),
					SortOrder: elrr.SortOrder,
				},
				Name: elrr.Name,
				URL:  elrr.URL,
			})
		}

		// Build Hermes document related resources for database model.
		hdrrs := []models.ProjectRelatedResourceHermesDocument{}
		for _, hdrr := range req.HermesDocuments {
			hdrrs = append(hdrrs, models.ProjectRelatedResourceHermesDocument{
				RelatedResource: models.ProjectRelatedResource{
					ProjectID: projectID,
					SortOrder: hdrr.SortOrder,
				},
				Document: models.Document{
					GoogleFileID: hdrr.GoogleFileID,
				},
			})
		}

		// Replace related resources for project.
		if err := proj.ReplaceRelatedResources(srv.DB, elrrs, hdrrs); err != nil {
			srv.Logger.Error("error replacing related resources for document",
				append([]interface{}{
					"error", err,
				}, logArgs...)...)
			http.Error(
				w, "Error processing request", http.StatusInternalServerError)
			return
		}

		srv.Logger.Info("replaced related resources for project", logArgs...)

	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
}