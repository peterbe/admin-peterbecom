import {
  Alert,
  Box,
  Button,
  Code,
  Group,
  LoadingOverlay,
  Modal,
  Table,
} from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { categoriesQueryKey, fetchCategories } from "../api-utils"
import { PublicURL } from "../public-url-link"
import { Delete } from "./delete"
import { Edit } from "./edit"
import type { Category, ServerData } from "./types"

export function List() {
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null)
  const { data, error, isPending } = useQuery<ServerData>({
    queryKey: categoriesQueryKey(),
    queryFn: fetchCategories,
  })

  return (
    <Box mb={50} pos="relative">
      <LoadingOverlay visible={isPending} />
      <Modal
        opened={Boolean(editCategory)}
        onClose={() => setEditCategory(null)}
        title={editCategory?.id ? "Edit Category" : "Add Category"}
      >
        {editCategory && (
          <Edit
            category={editCategory}
            onClose={() => {
              setEditCategory(null)
            }}
          />
        )}
      </Modal>

      <Modal
        opened={Boolean(deleteCategory)}
        onClose={() => setDeleteCategory(null)}
        title="Delete Category"
      >
        {deleteCategory && (
          <Delete
            category={deleteCategory}
            onClose={() => setDeleteCategory(null)}
          />
        )}
      </Modal>

      {error && <Alert color="red">Error: {error.message}</Alert>}

      <Button
        ta="right"
        variant="subtle"
        onClick={() => {
          setEditCategory({
            id: 0,
            name: "",
          } as Category)
        }}
      >
        Add new category
      </Button>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Uses</Table.Th>
            <Table.Th>Edit</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data?.categories.map((category) => {
            return (
              <Table.Tr key={category.id}>
                <Table.Td>
                  <Code>{category.name}</Code>
                </Table.Td>
                <Table.Td>
                  <PublicURL path={`/oc-${category.name.replace(/\s+/g, "+")}`}>
                    {category.count}
                  </PublicURL>
                </Table.Td>
                <Table.Td>
                  <Group>
                    <Button
                      variant="subtle"
                      onClick={() => setEditCategory(category)}
                    >
                      Edit
                    </Button>
                    {!category.count && (
                      <Button
                        variant="subtle"
                        color="orange"
                        onClick={() => setDeleteCategory(category)}
                      >
                        Delete
                      </Button>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            )
          })}
        </Table.Tbody>
      </Table>
    </Box>
  )
}
